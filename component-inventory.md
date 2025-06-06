# Component Inventory

This document catalogs the reusable UI components in the `/components/ui/` directory, their props, and styling patterns.

## 1. shadcn/ui Integration

The project uses `shadcn/ui` for its base components. The configuration in `components.json` confirms this:

-   **Style**: `default`
-   **Base Color**: `zinc`
-   **CSS Variables**: `true`

This means the components are built on Radix UI primitives and styled with Tailwind CSS using CSS variables for theming.

## 2. Component List & Usage

The following components are available in `/components/ui/`:

### `AlertDialog`

-   **File**: `alert-dialog.tsx`
-   **Purpose**: Displays a modal dialog that interrupts the user and requires an action.
-   **Exports**: `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`.
-   **Props**: Built on `Radix UI`'s Alert Dialog, it accepts standard Radix props. Styling is applied via `className`.
-   **Example Usage**:
    ```tsx
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    ```

### `Button`

-   **File**: `button.tsx`
-   **Purpose**: A standard button component with various styles.
-   **Props**:
    -   `variant`: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`.
    -   `size`: `default`, `sm`, `lg`, `icon`.
    -   `asChild`: `boolean` (to render as a child component).
-   **Example Usage**:
    ```tsx
    <Button variant="destructive" size="lg">Delete</Button>
    ```

### `Card`

-   **File**: `card.tsx`
-   **Purpose**: A container for content with a header, content, and footer.
-   **Exports**: `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`.
-   **Props**: Standard `div` props with `className` for styling.
-   **Example Usage**:
    ```tsx
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
    ```

### `DropdownMenu`

-   **File**: `dropdown-menu.tsx`
-   **Purpose**: Displays a menu to the user — such as a set of actions or functions — triggered by a button.
-   **Exports**: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, etc.
-   **Props**: Based on Radix UI, accepts standard Radix props.
-   **Example Usage**:
    ```tsx
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    ```

### `Input`

-   **File**: `input.tsx`
-   **Purpose**: A standard text input field.
-   **Props**: Standard `input` element props.
-   **Example Usage**:
    ```tsx
    <Input type="email" placeholder="Email" />
    ```

### `Label`

-   **File**: `label.tsx`
-   **Purpose**: A label for form elements.
-   **Props**: Standard `label` element props.
-   **Example Usage**:
    ```tsx
    <Label htmlFor="email">Your email address</Label>
    ```

### `Select`

-   **File**: `select.tsx`
-   **Purpose**: A control that allows users to select an option from a list.
-   **Exports**: `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, etc.
-   **Props**: Based on Radix UI, accepts standard Radix props.
-   **Example Usage**:
    ```tsx
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
    ```

### `Separator`

-   **File**: `separator.tsx`
-   **Purpose**: A visual separator line.
-   **Props**: `orientation` (`horizontal` or `vertical`).
-   **Example Usage**:
    ```tsx
    <Separator orientation="horizontal" />
    ```

### `Sheet`

-   **File**: `sheet.tsx`
-   **Purpose**: A slide-in panel that can be used for sidebars or context drawers.
-   **Exports**: `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, etc.
-   **Props**: `side` (`top`, `bottom`, `left`, `right`).
-   **Example Usage**:
    ```tsx
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
    ```

### `Sidebar`

-   **File**: `sidebar.tsx`
-   **Purpose**: A highly-configurable and composable sidebar component. It's custom-built for this application, not a standard shadcn/ui component, but it uses shadcn components like `Sheet` and `Button`.
-   **Exports**: `SidebarProvider`, `Sidebar`, `SidebarTrigger`, `SidebarContent`, etc.
-   **Props**: `side`, `variant`, `collapsible`. It has its own context provider (`SidebarProvider`) for state management.

### `Skeleton`

-   **File**: `skeleton.tsx`
-   **Purpose**: A placeholder component to indicate loading content.
-   **Props**: Standard `div` props.
-   **Example Usage**:
    ```tsx
    <Skeleton className="h-4 w-[250px]" />
    ```

### `Textarea`

-   **File**: `textarea.tsx`
-   **Purpose**: A multi-line text input field.
-   **Props**: Standard `textarea` element props.
-   **Example Usage**:
    ```tsx
    <Textarea placeholder="Type your message here." />
    ```

### `Tooltip`

-   **File**: `tooltip.tsx`
-   **Purpose**: A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.
-   **Exports**: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`.
-   **Props**: Based on Radix UI, accepts standard Radix props.
-   **Example Usage**:
    ```tsx
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tooltip content</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    ```

## 3. Custom Styling Patterns

The `tailwind.config.ts` file reveals several custom styling patterns:

-   **Fonts**: `Geist` and `Geist Mono` are configured as the primary sans-serif and monospace fonts.
-   **Theming**: Colors are defined using CSS variables (e.g., `hsl(var(--background))`), which is standard for `shadcn/ui` and allows for easy light/dark mode switching.
-   **Custom Colors**: The configuration includes a special `sidebar` color palette, indicating that the sidebar has its own distinct theme properties (`sidebar-background`, `sidebar-foreground`, etc.). This is a key pattern to follow for consistency when modifying navigation elements.
-   **Radius**: Border radius is also controlled by a CSS variable (`--radius`), ensuring consistent rounding across components.
