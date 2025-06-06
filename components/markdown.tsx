import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

const components: Partial<Components> = {
  // @ts-expect-error
  code: CodeBlock,
  pre: ({ children }) => <>{children}</>,
  p: ({ children }) => {
    // Check if the paragraph contains any code blocks at any level
    // to avoid invalid HTML nesting of <pre> inside <p>
    const hasCodeBlock = (element: any): boolean => {
      if (!element) return false;
      
      // Check if this element is a code block
      if (React.isValidElement(element)) {
        if (
          element.type === CodeBlock ||
          // @ts-expect-error
          element.props?.node?.tagName === 'code' ||
          // @ts-expect-error
          element.props?.className?.includes('language-') ||
          // @ts-expect-error
          element.type?.name === 'CodeBlock'
        ) {
          return true;
        }
        
        // Check children recursively
        if (element.props?.children) {
          const childrenArray = React.Children.toArray(element.props.children);
          return childrenArray.some((child) => hasCodeBlock(child));
        }
      }
      
      // Check if it's an array of elements
      if (Array.isArray(element)) {
        return element.some((child) => hasCodeBlock(child));
      }
      
      return false;
    };
    
    // If any child contains a code block, render without paragraph wrapper
    if (hasCodeBlock(children)) {
      return <div className="mb-2 last:mb-0">{children}</div>;
    }
    
    return <p className="mb-2 last:mb-0">{children}</p>;
  },
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      // @ts-expect-error
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
