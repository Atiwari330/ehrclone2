Directory structure:
└── peers-peerjs.git/
    ├── README.md
    ├── CHANGELOG.md
    ├── jest.config.cjs
    ├── LICENSE
    ├── package.json
    ├── renovate.json
    ├── tsconfig.json
    ├── .deepsource.toml
    ├── .prettierignore
    ├── .prettierrc.toml
    ├── .releaserc.json
    ├── __test__/
    │   ├── faker.ts
    │   ├── logger.spec.ts
    │   ├── peer.spec.ts
    │   ├── setup.ts
    │   └── util.spec.ts
    ├── e2e/
    │   ├── alice.html
    │   ├── bob.html
    │   ├── commit_data.js
    │   ├── data.js
    │   ├── package.json
    │   ├── style.css
    │   ├── tsconfig.json
    │   ├── types.d.ts
    │   ├── wdio.bstack.conf.ts
    │   ├── wdio.local.conf.ts
    │   ├── wdio.shared.conf.ts
    │   ├── .eslintrc
    │   ├── datachannel/
    │   │   ├── arraybuffers.js
    │   │   ├── arraybuffers_as_uint8array.js
    │   │   ├── arrays.js
    │   │   ├── arrays_unchunked.js
    │   │   ├── blobs.js
    │   │   ├── dates.js
    │   │   ├── dates_as_json_string.js
    │   │   ├── dates_as_string.js
    │   │   ├── files.js
    │   │   ├── Int32Array.js
    │   │   ├── Int32Array_as_ArrayBuffer.js
    │   │   ├── Int32Array_as_Uint8Array.js
    │   │   ├── long_string.js
    │   │   ├── numbers.js
    │   │   ├── objects.js
    │   │   ├── serialization.html
    │   │   ├── serialization.js
    │   │   ├── serialization.page.ts
    │   │   ├── serialization_binary.spec.ts
    │   │   ├── serialization_json.spec.ts
    │   │   ├── serialization_msgpack.spec.ts
    │   │   ├── serializationTest.ts
    │   │   ├── strings.js
    │   │   ├── typed_array_view.js
    │   │   ├── TypedArrayView_as_ArrayBuffer.js
    │   │   ├── Uint8Array.js
    │   │   └── Uint8Array_as_ArrayBuffer.js
    │   ├── mediachannel/
    │   │   ├── close.html
    │   │   ├── close.js
    │   │   ├── close.page.ts
    │   │   └── close.spec.ts
    │   └── peer/
    │       ├── disconnected.html
    │       ├── id-taken.html
    │       ├── peer.page.ts
    │       ├── peer.spec.ts
    │       └── server-unavailable.html
    ├── lib/
    │   ├── api.ts
    │   ├── baseconnection.ts
    │   ├── encodingQueue.ts
    │   ├── enums.ts
    │   ├── exports.ts
    │   ├── global.ts
    │   ├── logger.ts
    │   ├── mediaconnection.ts
    │   ├── msgPackPeer.ts
    │   ├── negotiator.ts
    │   ├── optionInterfaces.ts
    │   ├── peer.ts
    │   ├── peerError.ts
    │   ├── servermessage.ts
    │   ├── socket.ts
    │   ├── supports.ts
    │   ├── util.ts
    │   ├── version.ts
    │   ├── dataconnection/
    │   │   ├── DataConnection.ts
    │   │   ├── BufferedConnection/
    │   │   │   ├── BinaryPack.ts
    │   │   │   ├── binaryPackChunker.ts
    │   │   │   ├── BufferedConnection.ts
    │   │   │   ├── Json.ts
    │   │   │   └── Raw.ts
    │   │   └── StreamConnection/
    │   │       ├── MsgPack.ts
    │   │       └── StreamConnection.ts
    │   └── utils/
    │       ├── randomToken.ts
    │       └── validateId.ts
    └── .github/
        ├── FUNDING.yml
        └── workflows/
            ├── browserstack.yml
            ├── codeql-analysis.yml
            ├── prettier.yml
            ├── release.yml
            └── test.yml


Files Content:

================================================
FILE: README.md
================================================
# PeerJS: Simple peer-to-peer with WebRTC

[![Backers on Open Collective](https://opencollective.com/peer/backers/badge.svg)](#backers)
[![Sponsors on Open Collective](https://opencollective.com/peer/sponsors/badge.svg)](#sponsors)
[![Discord](https://img.shields.io/discord/1016419835455996076?color=5865F2&label=Discord&logo=discord&logoColor=white)](https://discord.gg/Ud2PvAtK37)

PeerJS provides a complete, configurable, and easy-to-use peer-to-peer API built on top of WebRTC, supporting both data channels and media streams.

## Live Example

Here's an example application that uses both media and data connections: https://glitch.com/~peerjs-video. The example also uses its own [PeerServer](https://github.com/peers/peerjs-server).

---

<p align="center">
  <sup>Special Announcement:</sup>
  <br>
  <a href="https://discord.gg/Ud2PvAtK37">
    <img width="70px" src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/625e5fcef7ab80b8c1fe559e_Discord-Logo-Color.png" />
  </a>
  <br>
  <sub><b>We now have a Discord Channel</b></sub>
  <br>
  <sub>There we plan to discuss roadmaps, feature requests, and more<br><a href="https://discord.gg/Ud2PvAtK37">Join us today</a></sub>
</p>

---

## Setup

**Include the library**

with npm:
`npm install peerjs`

with yarn:
`yarn add peerjs`

```js
// The usage -
import { Peer } from "peerjs";
```

**Create a Peer**

```javascript
const peer = new Peer("pick-an-id");
// You can pick your own id or omit the id if you want to get a random one from the server.
```

## Data connections

**Connect**

```javascript
const conn = peer.connect("another-peers-id");
conn.on("open", () => {
	conn.send("hi!");
});
```

**Receive**

```javascript
peer.on("connection", (conn) => {
	conn.on("data", (data) => {
		// Will print 'hi!'
		console.log(data);
	});
	conn.on("open", () => {
		conn.send("hello!");
	});
});
```

## Media calls

**Call**

```javascript
navigator.mediaDevices.getUserMedia(
	{ video: true, audio: true },
	(stream) => {
		const call = peer.call("another-peers-id", stream);
		call.on("stream", (remoteStream) => {
			// Show stream in some <video> element.
		});
	},
	(err) => {
		console.error("Failed to get local stream", err);
	},
);
```

**Answer**

```javascript
peer.on("call", (call) => {
	navigator.mediaDevices.getUserMedia(
		{ video: true, audio: true },
		(stream) => {
			call.answer(stream); // Answer the call with an A/V stream.
			call.on("stream", (remoteStream) => {
				// Show stream in some <video> element.
			});
		},
		(err) => {
			console.error("Failed to get local stream", err);
		},
	);
});
```

## Running tests

```bash
npm test
```

## Browser support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Safari |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 80+                                                                                                                                                                                                               | 83+                                                                                                                                                                                                           | 83+                                                                                                                                                                                                     | 15+                                                                                                                                                                                                           |

We test PeerJS against these versions of Chrome, Edge, Firefox, and Safari with [BrowserStack](https://www.browserstack.com) to ensure compatibility.
It may work in other and older browsers, but we don't officially support them.
Changes to browser support will be a breaking change going forward.

> [!NOTE]
> Firefox 102+ is required for CBOR / MessagePack support.

## FAQ

Q. I have a message `Critical dependency: the request of a dependency is an expression` in browser's console

A. The message occurs when you use PeerJS with Webpack. It is not critical! It relates to Parcel https://github.com/parcel-bundler/parcel/issues/2883 We'll resolve it when updated to Parcel V2.

## Links

### [Documentation / API Reference](https://peerjs.com/docs/)

### [PeerServer](https://github.com/peers/peerjs-server)

### [Discuss PeerJS on our Telegram Channel](https://t.me/joinchat/ENhPuhTvhm8WlIxTjQf7Og)

### [Changelog](https://github.com/peers/peerjs/blob/master/CHANGELOG.md)

## Contributors

This project exists thanks to all the people who contribute.
<a href="https://github.com/peers/peerjs/graphs/contributors"><img src="https://opencollective.com/peer/contributors.svg?width=890&button=false" /></a>

## Backers

Thank you to all our backers! [[Become a backer](https://opencollective.com/peer#backer)]

<a href="https://opencollective.com/peer/backer/0/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/0/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/1/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/1/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/2/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/2/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/3/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/3/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/4/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/4/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/5/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/5/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/6/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/6/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/7/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/7/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/8/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/8/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/9/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/9/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/10/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/10/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/11/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/11/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/12/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/12/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/13/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/13/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/14/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/14/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/15/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/15/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/16/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/16/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/17/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/17/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/18/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/18/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/19/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/19/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/20/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/20/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/21/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/21/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/22/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/22/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/23/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/23/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/24/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/24/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/25/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/25/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/26/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/26/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/27/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/27/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/28/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/28/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/29/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/29/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/30/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/30/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/31/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/31/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/32/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/32/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/33/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/33/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/34/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/34/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/35/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/35/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/36/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/36/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/37/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/37/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/38/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/38/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/39/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/39/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/40/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/40/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/41/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/41/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/42/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/42/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/43/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/43/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/44/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/44/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/45/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/45/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/46/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/46/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/47/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/47/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/48/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/48/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/49/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/49/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/50/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/50/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/51/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/51/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/52/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/52/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/53/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/53/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/54/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/54/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/55/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/55/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/56/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/56/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/57/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/57/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/58/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/58/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/59/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/59/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/60/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/60/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/61/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/61/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/62/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/62/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/63/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/63/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/64/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/64/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/65/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/65/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/66/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/66/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/67/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/67/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/68/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/68/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/69/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/69/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/70/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/70/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/71/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/71/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/72/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/72/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/73/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/73/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/74/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/74/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/75/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/75/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/76/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/76/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/77/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/77/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/78/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/78/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/79/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/79/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/80/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/80/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/81/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/81/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/82/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/82/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/83/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/83/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/84/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/84/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/85/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/85/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/86/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/86/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/87/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/87/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/88/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/88/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/89/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/89/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/90/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/90/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/91/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/91/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/92/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/92/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/93/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/93/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/94/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/94/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/95/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/95/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/96/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/96/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/97/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/97/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/98/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/98/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/99/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/99/avatar.svg?requireActive=false"/></a>
<a href="https://opencollective.com/peer/backer/100/website?requireActive=false" target="_blank"><img src="https://opencollective.com/peer/backer/100/avatar.svg?requireActive=false"/></a>

## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/peer#sponsor)]

<a href="https://opencollective.com/peer/sponsor/1/website" target="_blank"><img src="https://opencollective.com/peer/sponsor/1/avatar.svg"/></a>
<a href="https://opencollective.com/peer/sponsor/2/website" target="_blank"><img src="https://opencollective.com/peer/sponsor/2/avatar.svg"/></a>
<a href="https://opencollective.com/peer/sponsor/0/website" target="_blank"><img src="https://opencollective.com/peer/sponsor/0/avatar.svg"/></a>
<a href="https://opencollective.com/peer/sponsor/3/website" target="_blank"><img src="https://opencollective.com/peer/sponsor/3/avatar.svg"/></a>
<a href="https://opencollective.com/peer/sponsor/4/website" target="_blank"><img src="https://opencollective.com/peer/sponsor/4/avatar.svg"/></a>
<a href="https://opencollective.com/peer/sponsor/5/website" target="_blank"><img src="https://opencollective.com/peer/sponsor/5/avatar.svg"/></a>
<a href="https://opencollective.com/peer/sponsor/6/website" target="_blank"><img src="https://opencollective.com/peer/sponsor/6/avatar.svg"/></a>
<a href="https://opencollective.com/peer/sponsor/7/website" target="_blank"><img src="https://opencollective.com/peer/sponsor/7/avatar.svg"/></a>
<a href="https://opencollective.com/peer/sponsor/8/website" target="_blank"><img src="https://opencollective.com/peer/sponsor/8/avatar.svg"/></a>
<a href="https://opencollective.com/peer/sponsor/9/website" target="_blank"><img src="https://opencollective.com/peer/sponsor/9/avatar.svg"/></a>

## License

PeerJS is licensed under the [MIT License](https://tldrlegal.com/l/mit).



================================================
FILE: CHANGELOG.md
================================================
## [1.5.5](https://github.com/peers/peerjs/compare/v1.5.4...v1.5.5) (2025-06-07)


### Bug Fixes

* inline package version ([bd6e017](https://github.com/peers/peerjs/commit/bd6e0170c16a0dedc16a4128b81482f109b390a0)), closes [#1322](https://github.com/peers/peerjs/issues/1322)

## [1.5.4](https://github.com/peers/peerjs/compare/v1.5.3...v1.5.4) (2024-05-14)


### Bug Fixes

* **deps:** update dependency webrtc-adapter to v9 ([#1266](https://github.com/peers/peerjs/issues/1266)) ([5536abf](https://github.com/peers/peerjs/commit/5536abf8d6345c248df875e0e22c520a20cb2919))
* remove CBOR ([badc9e8](https://github.com/peers/peerjs/commit/badc9e8bc4f7ce5517de3a58abcaec1d566eccf5)), closes [#1271](https://github.com/peers/peerjs/issues/1271) [#1247](https://github.com/peers/peerjs/issues/1247) [#1271](https://github.com/peers/peerjs/issues/1271)

## [1.5.3](https://github.com/peers/peerjs/compare/v1.5.2...v1.5.3) (2024-05-11)


### Bug Fixes

* navigator is not defined. ([#1202](https://github.com/peers/peerjs/issues/1202)) ([4b7a74d](https://github.com/peers/peerjs/commit/4b7a74d74c50461fde80e84992d88a9d564dbe72)), closes [#1165](https://github.com/peers/peerjs/issues/1165)
* remove need for `unsafe-eval` ([3fb31b3](https://github.com/peers/peerjs/commit/3fb31b316b8f4d699d087e1b465e908688be3872))

## [1.5.2](https://github.com/peers/peerjs/compare/v1.5.1...v1.5.2) (2023-12-05)


### Bug Fixes

* support Blobs nested in objects ([7956dd6](https://github.com/peers/peerjs/commit/7956dd640388fce62c83453d56e1a20aec2212b2)), closes [#1163](https://github.com/peers/peerjs/issues/1163)

## [1.5.1](https://github.com/peers/peerjs/compare/v1.5.0...v1.5.1) (2023-09-23)


### Bug Fixes

* convert `Blob`s to `ArrayBuffer`s during `.send()` ([95bb0f7](https://github.com/peers/peerjs/commit/95bb0f7fa9aa0d119613727c32857e5af33e14a1)), closes [#1137](https://github.com/peers/peerjs/issues/1137)
* convert `Blob`s to `ArrayBuffer`s during `.send()` ([#1142](https://github.com/peers/peerjs/issues/1142)) ([094f849](https://github.com/peers/peerjs/commit/094f849816d327bf74a447fbf7d58195c1a4fc66))

# [1.5.0](https://github.com/peers/peerjs/compare/v1.4.7...v1.5.0) (2023-09-03)


### Bug Fixes

* **datachannel:** sending order is now preserved correctly ([#1038](https://github.com/peers/peerjs/issues/1038)) ([0fb6179](https://github.com/peers/peerjs/commit/0fb61792ed3afe91123550a159c8633ed0976f89)), closes [#746](https://github.com/peers/peerjs/issues/746)
* **deps:** update dependency @swc/helpers to ^0.4.0 ([a7de8b7](https://github.com/peers/peerjs/commit/a7de8b78f57a5cf9708fa54e9f82f4ab43c0bca2))
* **deps:** update dependency cbor-x to v1.5.4 ([c1f04ec](https://github.com/peers/peerjs/commit/c1f04ecf686e64266fb54b3e4992c73c1522ae79))
* **deps:** update dependency eventemitter3 to v5 ([caf01c6](https://github.com/peers/peerjs/commit/caf01c6440534cbe190facd84cecf9ca62e4a5ce))
* **deps:** update dependency peerjs-js-binarypack to v1.0.2 ([7452e75](https://github.com/peers/peerjs/commit/7452e7591d4982d9472c524d6ad30e66c2a2b44f))
* **deps:** update dependency webrtc-adapter to v8 ([431f00b](https://github.com/peers/peerjs/commit/431f00bd89809867a19c98224509982b82769558))
* **deps:** update dependency webrtc-adapter to v8.2.2 ([62402fc](https://github.com/peers/peerjs/commit/62402fcae03c78382d7fa80c11f459aca8d21620))
* **deps:** update dependency webrtc-adapter to v8.2.3 ([963455e](https://github.com/peers/peerjs/commit/963455ee383a069e53bd93b1128d82615a698245))
* **MediaConnection:** `close` event is fired on remote Peer ([0836356](https://github.com/peers/peerjs/commit/0836356d18c91449f4cbb23e4d4660a4351d7f56)), closes [#636](https://github.com/peers/peerjs/issues/636) [#1089](https://github.com/peers/peerjs/issues/1089) [#1032](https://github.com/peers/peerjs/issues/1032) [#832](https://github.com/peers/peerjs/issues/832) [#780](https://github.com/peers/peerjs/issues/780) [#653](https://github.com/peers/peerjs/issues/653)
* **npm audit:** Updates all dependencies that cause npm audit to issue a warning ([6ef5707](https://github.com/peers/peerjs/commit/6ef5707dc85d8b921d8dfea74890b110ddf5cd4f))


### Features

* `.type` property on `Error`s emitted from connections ([#1126](https://github.com/peers/peerjs/issues/1126)) ([debe7a6](https://github.com/peers/peerjs/commit/debe7a63474b9cdb705676d4c7892b0cd294402a))
* `PeerError` from connections ([ad3a0cb](https://github.com/peers/peerjs/commit/ad3a0cbe8c5346509099116441e6c3ff0b6ca6c4))
* **DataConnection:** handle close messages and flush option ([6ca38d3](https://github.com/peers/peerjs/commit/6ca38d32b0929745b92a55c8f6aada1ee0895ce7)), closes [#982](https://github.com/peers/peerjs/issues/982)
* **MediaChannel:** Add experimental `willCloseOnRemote` event to MediaConnection. ([ed84829](https://github.com/peers/peerjs/commit/ed84829a1092422f3d7f92f467bcf5b8ada82891))
* MsgPack/Cbor serialization ([fcffbf2](https://github.com/peers/peerjs/commit/fcffbf243cb7d6dabfc773211c155c0ae1e00baf))
* MsgPack/Cbor serialization ([#1120](https://github.com/peers/peerjs/issues/1120)) ([4367256](https://github.com/peers/peerjs/commit/43672564ee9edcb15e736b0333c6ad8aeae20c59)), closes [#611](https://github.com/peers/peerjs/issues/611)

## [1.4.7](https://github.com/peers/peerjs/compare/v1.4.6...v1.4.7) (2022-08-09)


### Bug Fixes

* **browser-bundle:** Leaked private functions in the global scope ([857d425](https://github.com/peers/peerjs/commit/857d42524a929388b352a2330f18fdfc15df6c22)), closes [#989](https://github.com/peers/peerjs/issues/989)

## [1.4.6](https://github.com/peers/peerjs/compare/v1.4.5...v1.4.6) (2022-05-25)


### Bug Fixes

* **typings:** `MediaConnection.answer()` doesn’t need a `stream` anymore, thanks [@matallui](https://github.com/matallui)! ([666dcd9](https://github.com/peers/peerjs/commit/666dcd9770fe080e00898b9138664e8996bf5162))
* **typings:** much stronger event typings for `DataConnection`,`MediaConnection` ([0c96603](https://github.com/peers/peerjs/commit/0c96603a3f97f28eabe24906e692c31ef0ebca13))


### Performance Improvements

* **turn:** reduce turn server count ([8816f54](https://github.com/peers/peerjs/commit/8816f54c4b4bff5f6bd0c7ccf5327ec84e80a8ca))

## [1.4.5](https://github.com/peers/peerjs/compare/v1.4.4...v1.4.5) (2022-05-24)


### Bug Fixes

* **referrerPolicy:** you can now set a custom referrerPolicy for api requests ([c0ba9e4](https://github.com/peers/peerjs/commit/c0ba9e4b64f233c2733a8c5e904a8536ae37eb42)), closes [#955](https://github.com/peers/peerjs/issues/955)
* **typings:** add missing type exports ([#959](https://github.com/peers/peerjs/issues/959)) ([3c915d5](https://github.com/peers/peerjs/commit/3c915d57bb18ac822d3438d879717266ee84b635)), closes [#961](https://github.com/peers/peerjs/issues/961)

## [1.4.4](https://github.com/peers/peerjs/compare/v1.4.3...v1.4.4) (2022-05-13)


### Bug Fixes

* **CRA@4:** import hack ([41c3ba7](https://github.com/peers/peerjs/commit/41c3ba7b2ca6adc226efd0e2add546a570a4aa3a)), closes [#954](https://github.com/peers/peerjs/issues/954)
* **source maps:** enable source map inlining ([97a724b](https://github.com/peers/peerjs/commit/97a724b6a1e04817d79ecaf91d4384ae3a94cf99))

## [1.4.3](https://github.com/peers/peerjs/compare/v1.4.2...v1.4.3) (2022-05-13)


### Bug Fixes

* **typings:** export interfaces ([979e695](https://github.com/peers/peerjs/commit/979e69545cc2fe10c60535ac9793140ef8dba4ec)), closes [#953](https://github.com/peers/peerjs/issues/953)

## [1.4.2](https://github.com/peers/peerjs/compare/v1.4.1...v1.4.2) (2022-05-12)


### Bug Fixes

* **bundler import:** enable module target ([b5beec4](https://github.com/peers/peerjs/commit/b5beec4a07827f82c5e50c79c71a8cfb1ec3c40e)), closes [#761](https://github.com/peers/peerjs/issues/761)

## [1.4.1](https://github.com/peers/peerjs/compare/v1.4.0...v1.4.1) (2022-05-11)


### Bug Fixes

* **old bundlers:** include support for Node 10 (EOL since 2021-04-01) / old bundlers ([c0f4648](https://github.com/peers/peerjs/commit/c0f4648b1c104e5e0e5967bb239c217288aa83e0)), closes [#952](https://github.com/peers/peerjs/issues/952)

# [1.4.0](https://github.com/peers/peerjs/compare/v1.3.2...v1.4.0) (2022-05-10)


### Bug Fixes

* add changelog and npm version to the repo ([d5bd955](https://github.com/peers/peerjs/commit/d5bd9552daf5d42f9d04b3087ddc34c729004daa))
* add token to PeerJSOption type definition ([e7675e1](https://github.com/peers/peerjs/commit/e7675e1474b079b2804167c70335a6c6e2b8ec08))
* websocket connection string ([82b8c71](https://github.com/peers/peerjs/commit/82b8c713bc03be34c2526bdf442a583c4d547c83))


### Features

* upgrade to Parcel@2 ([aae9d1f](https://github.com/peers/peerjs/commit/aae9d1fa37731d0819f93535b8ad78fe4b685d1e)), closes [#845](https://github.com/peers/peerjs/issues/845) [#859](https://github.com/peers/peerjs/issues/859) [#552](https://github.com/peers/peerjs/issues/552) [#585](https://github.com/peers/peerjs/issues/585)


### Performance Improvements

* **turn:** lower TURN-latency due to more local servers ([a412ea4](https://github.com/peers/peerjs/commit/a412ea4984a46d50de8873904b7067897b0f29f9))

<a name="1.3.2"></a>

## 1.3.2 (2021-03-11)

- fixed issues #800, #803 in PR #806, thanks @jordanaustin
- updated devDeps: `typescript` to 4.2

<a name="1.3.1"></a>

## 1.3.1 (2020-07-11)

- fixed: map file resolving
- removed: @types/webrtc because it contains in ts dom lib.

<a name="1.3.0"></a>

## 1.3.0 (2020-07-03)

- changed: don't close the Connection if `iceConnectionState` changed to `disconnected`

<a name="1.2.0"></a>

## 1.2.0 (2019-12-24)

- added: ability to change json stringify / json parse methods for DataConnection #592

- removed: `peerBrowser` field from `dataConnection` because unused

- fixed: lastServerId and reconnect #580 #534 #265

<a name="1.1.0"></a>

## 1.1.0 (2019-09-16)

- removed: deprecated `RtpDataChannels` and `DtlsSrtpKeyAgreement` options
- removed: grunt from deps, upgrade deps versions
- removed: Reliable dep because modern browsers supports `RTCDataChannel.ordered` property

- added: TURN server to default config

- fixed: emit error message, then destroy/disconnect when error occurred
- fixed: use `peerjs-js-binarypack` instead of `js-binarypack`
- fixed: sending large files via DataConnection #121

<a name="1.0.4"></a>

## 1.0.4 (2019-08-31)

- fixed: 'close' event for DataConnection #568

<a name="1.0.3"></a>

## 1.0.3 (2019-08-21)

- add pingInterval option

<a name="1.0.2"></a>

## 1.0.2 (2019-07-20)

### Bug Fixes

- fixed: memory leak in DataConnection #556
- fixed: missing sdpMid in IceServer #550

### Other

- updated: old @types/webrtc dependency #549

<a name="1.0.1"></a>

## 1.0.1 (2019-07-09)

### Bug Fixes

- fixed: readyState of undefined #520
- fixed: call sdpTransform in Answer #524
- fixed: sdpTransform does not apply to makeAnswer SDP #523

<a name="1.0.0"></a>

## 1.0.0 (2019-04-10)

### Refactoring

Almost all project was refactored!!!

- removed: xhr long-pooling #506
- changed: fetch api instead of xhr

### Features

- added: heartbeat #502

### Bug Fixes

- fixed: destroy RTCPeerConnection #513
- fixed: MediaStream memory leak #514

<a name="0.3.18"></a>

## 0.3.18 (2018-10-30)

### Features

- **typescript:** First commit ([0c77a5b](https://github.com/peers/peerjs/commit/0c77a5b))

<a name="0.3.16"></a>

## 0.3.16 (2018-08-21)

### Bug Fixes

- fixed typo in README ([f1bd47e](https://github.com/peers/peerjs/commit/f1bd47e))

## Version 0.3.14

- Patch for #246, which started as of Chrome 38.

## Version 0.3.11 (28 Sep 2014)

- Browserify build system

## Version 0.3.10 (29 Aug 2014)

- Fixed a bug where `disconnected` would be emitted for XHR requests that were aborted on purpose.

## Version 0.3.9 (11 July 2014)

- Allow an external adapter to be used (for `RTCPeerConnection` and such). (Thanks, @khankuan!)
- Fixed a bug where `_chunkedData` was not being cleared recursively, causing memory to be eaten up unnecessarily. (Thanks, @UnsungHero97!)
- Added `peer.reconnect()`, which allows a peer to reconnect to the signalling server with the same ID it had before after it has been disconnected. (Thanks, @jure, for the amazing input :)!)
- Added previously-missing error types, such as `webrtc`, `network`, and `peer-unavailable` error types. (Thanks, @mmis1000 for reporting!)
- Fixed a bug where the peer would infinitely attempt to start XHR streaming when there is no network connection available. Now, the peer will simply emit a `network` error and disconnect. (Thanks, @UnsungHero97 for reporting!)

## Version 0.3.8 beta (18 Mar 2014)

- **The following changes are only compatible with PeerServer 0.2.4.**
- Added the ability to specify a custom path when connecting to a self-hosted
  PeerServer.
- Added the ability to retrieve a list of all peers connected to the server.

## Version 0.3.7 beta (23 Dec 2013)

- Chrome 31+/Firefox 27+ DataConnection interop for files.
- Deprecate `binary-utf8` in favor of faster support for UTF8 in the regular
  `binary` serialization.
- Fix `invalid-key` error message.

## Version 0.3.6 beta (3 Dec 2013)

- Workaround for hitting Chrome 31+ buffer limit.
- Add `.bufferSize` to DataConnection to indicate the size of the buffer queue.
- Add `.dataChannel` to DataConnection as an alias for `._dc`, which contains
  the RTCDataChannel object associated with the DataConnection.
- Update BinaryPack dependency.

## Version 0.3.5 beta (26 Nov 2013)

- Fix bug where chunks were being emitted.

## Version 0.3.4 beta (11 Nov 2013)

- Fix file transfer issue in Chrome by chunking for data over 120KB.
- Use binary data when possible.
- Update BinaryPack dependency to fix inefficiencies.

## Version 0.3.3 beta (2 Nov 2013)

- Fix exceptions when peer emits errors upon creation
- Remove extra commas

## Version 0.3.2 beta (25 Oct 2013)

- Use SCTP in Chrome 31+.
- Work around Chrome 31+ tab crash. The crashes were due to Chrome's lack of support for the `maxRetransmits` parameter for modifying SDP.
- Fix exceptions in Chrome 29 and below.
- DataChannels are unreliable by default in Chrome 30 and below. In setting
  reliable to `true`, the reliable shim is used only in Chrome 30 and below.

## Version 0.3.1 beta (19 Oct 2013)

- Updated docs and examples for TURN server usage
- Fixed global variable leak
- DataConnections now have reliable: false by default. This will switch to on when reliable: true works in more browsers

## Version 0.3.0 beta (20 Sept 2013)

### Highlights

- Support for WebRTC video and audio streams in both Firefox and Chrome.
- Add `util.supports.[FEATURE]` flags, which represent the WebRTC features
  supported by your browser.
- **Breaking:** Deprecate current `Peer#connections` format. Connections will no longer be
  keyed by label and will instead be in a list.

### Other changes

- **Breaking:** Deprecate `Peer.browser` in favor of `util.browser`.
- Additional logging levels (warnings, errors, all).
- Additional logging functionality (`logFunction`).
- SSL option now in config rather than automatic.

## Version 0.2.8 (1 July 2013)

- Fix bug, no error on Firefox 24 due to missing error callback.
- TLS secure PeerServers now supported.
- Updated version of Reliable shim.

## Version 0.2.7 (28 May 2013)

- Fix bug, no error when .disconnect called in before socket connection established.
- Fix bug, failure to enter debug mode when aborting because browser not supported.

## Version 0.2.6 (2 May 2013)

- Peer.browser to check browser type.
- Update Reliable library and fix Reliable functionality in Chrome.

## Version 0.2.5 (24 Apr 2013)

- **Firefox compatibility for Firefox Nightly.**
- Misc bug fixes.

## Version 0.2.1 (3 Apr 2013)

- **Warning**: this build changes the error of type `peer-destroyed` to `server-disconnected`.
- ~~**Firefox compatibility.**~~ - Pushed back due to volatility of Firefox Nightly DataChannel APIs.
- Browser detection added. If an incompatible browser is detected, the `browser-incompatible` error is emitted from the `Peer`.
- Added a `.disconnect()` method to `Peer`, which can be called to close connections to the PeerServer (but not any active DataConnections).

## Version 0.2.0 (24 Mar 2013)

- **Warning**: this build introduces the following API changes that may break existing code.
  - `peer.connections` is no longer a hash mapping peer IDs to connections.
  - Connections no longer emit errors from `PeerConnection`; `PeerConnection` errors are now forwarded to the `Peer` object.
- Add support for multiple DataConnections with different labels.
- Update Reliable version to support faster file transfer.
- Fix bug where using XHR streaming to broker a connection occasionally fails.

## Version 0.1.7 (6 Mar 2013)

- Add experimental `reliable` messaging option. [See documentation.](https://github.com/peers/peerjs/blob/master/docs/api.md#experimental-reliable-and-large-file-transfer)
- Fix bug where the ID /GET request was cached and so two Peers created simultaneously would get the same ID: [See issue.](https://github.com/peers/peerjs-server/issues/2)
- Add support for relative hostname. [See documentation.](https://github.com/peers/peerjs/blob/master/docs/api.md#new-peerid-options)



================================================
FILE: jest.config.cjs
================================================
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	testEnvironment: "jsdom",
	transform: {
		"^.+\\.(t|j)sx?$": ["@swc/jest"],
	},
	modulePathIgnorePatterns: ["e2e"],
};



================================================
FILE: LICENSE
================================================
Copyright (c) 2015 Michelle Bu and Eric Zhang, http://peerjs.com

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



================================================
FILE: package.json
================================================
{
	"name": "peerjs",
	"version": "1.5.5",
	"keywords": [
		"peerjs",
		"webrtc",
		"p2p",
		"rtc"
	],
	"description": "PeerJS client",
	"homepage": "https://peerjs.com",
	"bugs": {
		"url": "https://github.com/peers/peerjs/issues"
	},
	"repository": {
		"type": "git",
		"url": "https://github.com/peers/peerjs"
	},
	"license": "MIT",
	"contributors": [
		"Michelle Bu <michelle@michellebu.com>",
		"afrokick <devbyru@gmail.com>",
		"ericz <really.ez@gmail.com>",
		"Jairo <kidandcat@gmail.com>",
		"Jonas Gloning <34194370+jonasgloning@users.noreply.github.com>",
		"Jairo Caro-Accino Viciana <jairo@galax.be>",
		"Carlos Caballero <carlos.caballero.gonzalez@gmail.com>",
		"hc <hheennrryy@gmail.com>",
		"Muhammad Asif <capripio@gmail.com>",
		"PrashoonB <prashoonbhattacharjee@gmail.com>",
		"Harsh Bardhan Mishra <47351025+HarshCasper@users.noreply.github.com>",
		"akotynski <aleksanderkotbury@gmail.com>",
		"lmb <i@lmb.io>",
		"Jairooo <jairocaro@msn.com>",
		"Moritz Stückler <moritz.stueckler@gmail.com>",
		"Simon <crydotsnakegithub@gmail.com>",
		"Denis Lukov <denismassters@gmail.com>",
		"Philipp Hancke <fippo@andyet.net>",
		"Hans Oksendahl <hansoksendahl@gmail.com>",
		"Jess <jessachandler@gmail.com>",
		"khankuan <khankuan@gmail.com>",
		"DUODVK <kurmanov.work@gmail.com>",
		"XiZhao <kwang1imsa@gmail.com>",
		"Matthias Lohr <matthias@lohr.me>",
		"=frank tree <=frnktrb@googlemail.com>",
		"Andre Eckardt <aeckardt@outlook.com>",
		"Chris Cowan <agentme49@gmail.com>",
		"Alex Chuev <alex@chuev.com>",
		"alxnull <alxnull@e.mail.de>",
		"Yemel Jardi <angel.jardi@gmail.com>",
		"Ben Parnell <benjaminparnell.94@gmail.com>",
		"Benny Lichtner <bennlich@gmail.com>",
		"fresheneesz <bitetrudpublic@gmail.com>",
		"bob.barstead@exaptive.com <bob.barstead@exaptive.com>",
		"chandika <chandika@gmail.com>",
		"emersion <contact@emersion.fr>",
		"Christopher Van <cvan@users.noreply.github.com>",
		"eddieherm <edhermoso@gmail.com>",
		"Eduardo Pinho <enet4mikeenet@gmail.com>",
		"Evandro Zanatta <ezanatta@tray.net.br>",
		"Gardner Bickford <gardner@users.noreply.github.com>",
		"Gian Luca <gianluca.cecchi@cynny.com>",
		"PatrickJS <github@gdi2290.com>",
		"jonnyf <github@jonathanfoss.co.uk>",
		"Hizkia Felix <hizkifw@gmail.com>",
		"Hristo Oskov <hristo.oskov@gmail.com>",
		"Isaac Madwed <i.madwed@gmail.com>",
		"Ilya Konanykhin <ilya.konanykhin@gmail.com>",
		"jasonbarry <jasbarry@me.com>",
		"Jonathan Burke <jonathan.burke.1311@googlemail.com>",
		"Josh Hamit <josh.hamit@gmail.com>",
		"Jordan Austin <jrax86@gmail.com>",
		"Joel Wetzell <jwetzell@yahoo.com>",
		"xizhao <kevin.wang@cloudera.com>",
		"Alberto Torres <kungfoobar@gmail.com>",
		"Jonathan Mayol <mayoljonathan@gmail.com>",
		"Jefferson Felix <me@jsfelix.dev>",
		"Rolf Erik Lekang <me@rolflekang.com>",
		"Kevin Mai-Husan Chia <mhchia@users.noreply.github.com>",
		"Pepijn de Vos <pepijndevos@gmail.com>",
		"JooYoung <qkdlql@naver.com>",
		"Tobias Speicher <rootcommander@gmail.com>",
		"Steve Blaurock <sblaurock@gmail.com>",
		"Kyrylo Shegeda <shegeda@ualberta.ca>",
		"Diwank Singh Tomer <singh@diwank.name>",
		"Sören Balko <Soeren.Balko@gmail.com>",
		"Arpit Solanki <solankiarpit1997@gmail.com>",
		"Yuki Ito <yuki@gnnk.net>",
		"Artur Zayats <zag2art@gmail.com>"
	],
	"funding": {
		"type": "opencollective",
		"url": "https://opencollective.com/peer"
	},
	"collective": {
		"type": "opencollective",
		"url": "https://opencollective.com/peer"
	},
	"files": [
		"dist/*"
	],
	"sideEffects": [
		"lib/global.ts",
		"lib/supports.ts"
	],
	"main": "dist/bundler.cjs",
	"module": "dist/bundler.mjs",
	"browser-minified": "dist/peerjs.min.js",
	"browser-unminified": "dist/peerjs.js",
	"browser-minified-msgpack": "dist/serializer.msgpack.mjs",
	"types": "dist/types.d.ts",
	"engines": {
		"node": ">= 14"
	},
	"targets": {
		"types": {
			"source": "lib/exports.ts"
		},
		"main": {
			"source": "lib/exports.ts",
			"sourceMap": {
				"inlineSources": true
			}
		},
		"module": {
			"source": "lib/exports.ts",
			"includeNodeModules": [
				"eventemitter3"
			],
			"sourceMap": {
				"inlineSources": true
			}
		},
		"browser-minified": {
			"context": "browser",
			"outputFormat": "global",
			"optimize": true,
			"engines": {
				"browsers": "chrome >= 83, edge >= 83, firefox >= 80, safari >= 15"
			},
			"source": "lib/global.ts"
		},
		"browser-unminified": {
			"context": "browser",
			"outputFormat": "global",
			"optimize": false,
			"engines": {
				"browsers": "chrome >= 83, edge >= 83, firefox >= 80, safari >= 15"
			},
			"source": "lib/global.ts"
		},
		"browser-minified-msgpack": {
			"context": "browser",
			"outputFormat": "esmodule",
			"isLibrary": true,
			"optimize": true,
			"engines": {
				"browsers": "chrome >= 83, edge >= 83, firefox >= 102, safari >= 15"
			},
			"source": "lib/dataconnection/StreamConnection/MsgPack.ts"
		}
	},
	"scripts": {
		"contributors": "git-authors-cli --print=false && prettier --write package.json && git add package.json package-lock.json && git commit -m \"chore(contributors): update and sort contributors list\"",
		"check": "tsc --noEmit && tsc -p e2e/tsconfig.json --noEmit",
		"watch": "parcel watch",
		"build": "npm run build:version && rm -rf dist && parcel build",
		"build:version": "echo \"export const version = \\\"$(node -p \"require('./package.json').version\")\\\";\" > lib/version.ts",
		"prepublishOnly": "npm run build",
		"test": "jest",
		"test:watch": "jest --watch",
		"coverage": "jest --coverage --collectCoverageFrom=\"./lib/**\"",
		"format": "prettier --write .",
		"format:check": "prettier --check .",
		"semantic-release": "semantic-release",
		"e2e": "wdio run e2e/wdio.local.conf.ts",
		"e2e:bstack": "wdio run e2e/wdio.bstack.conf.ts"
	},
	"devDependencies": {
		"@parcel/config-default": "^2.9.3",
		"@parcel/packager-ts": "^2.9.3",
		"@parcel/transformer-typescript-tsc": "^2.9.3",
		"@parcel/transformer-typescript-types": "^2.9.3",
		"@semantic-release/changelog": "^6.0.1",
		"@semantic-release/git": "^10.0.1",
		"@swc/core": "^1.3.27",
		"@swc/jest": "^0.2.24",
		"@types/jasmine": "^5.0.0",
		"@wdio/browserstack-service": "^8.11.2",
		"@wdio/cli": "^8.11.2",
		"@wdio/globals": "^8.11.2",
		"@wdio/jasmine-framework": "^8.11.2",
		"@wdio/local-runner": "^8.11.2",
		"@wdio/spec-reporter": "^8.11.2",
		"@wdio/types": "^8.10.4",
		"http-server": "^14.1.1",
		"jest": "^29.3.1",
		"jest-environment-jsdom": "^29.3.1",
		"mock-socket": "^9.0.0",
		"parcel": "^2.9.3",
		"prettier": "^3.0.0",
		"semantic-release": "^23.0.0",
		"ts-node": "^10.9.1",
		"typescript": "^5.0.0",
		"wdio-geckodriver-service": "^5.0.1"
	},
	"dependencies": {
		"@msgpack/msgpack": "^2.8.0",
		"eventemitter3": "^4.0.7",
		"peerjs-js-binarypack": "^2.1.0",
		"webrtc-adapter": "^9.0.0"
	},
	"alias": {
		"process": false,
		"buffer": false
	}
}



================================================
FILE: renovate.json
================================================
{
	"$schema": "https://docs.renovatebot.com/renovate-schema.json",
	"extends": ["config:recommended", ":assignAndReview(jonasgloning)"],
	"labels": ["dependencies"],
	"assignees": ["jonasgloning"],
	"major": {
		"dependencyDashboardApproval": true
	},
	"packageRules": [
		{
			"matchDepTypes": ["devDependencies"],
			"addLabels": ["dev-dependencies"],
			"automerge": true,
			"automergeType": "branch"
		},
		{
			"matchUpdateTypes": ["minor", "patch"],
			"matchCurrentVersion": "!/^0/",
			"automerge": true,
			"automergeType": "branch"
		}
	],
	"lockFileMaintenance": {
		"enabled": true,
		"automerge": true,
		"automergeType": "branch"
	}
}



================================================
FILE: tsconfig.json
================================================
{
	"compilerOptions": {
		"target": "es5",
		"module": "commonjs",
		"downlevelIteration": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"skipLibCheck": true,
		"isolatedModules": true,
		"resolveJsonModule": true,
		"lib": ["es2020", "dom"],
		"paths": {
			"cbor-x/index-no-eval": ["./node_modules/cbor-x"]
		}
	},
	"exclude": ["node_modules", "dist", "e2e"]
}



================================================
FILE: .deepsource.toml
================================================
version = 1

test_patterns = ["test/**"]

[[analyzers]]
name = "javascript"
enabled = true

  [analyzers.meta]
  environment = [
    "nodejs",
    "mocha"
  ]
  dialect = "typescript"



================================================
FILE: .prettierignore
================================================
dist
docs
package-json.lock

# semantic-release
CHANGELOG.md


================================================
FILE: .prettierrc.toml
================================================
trailingComma = "all"
semi = true
useTabs = true


================================================
FILE: .releaserc.json
================================================
{
	"branches": ["stable", { "name": "rc", "prerelease": true }],
	"plugins": [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		"@semantic-release/changelog",
		"@semantic-release/npm",
		"@semantic-release/git",
		"@semantic-release/github"
	]
}



================================================
FILE: __test__/faker.ts
================================================
import { WebSocket } from "mock-socket";
import "webrtc-adapter";

const fakeGlobals = {
	WebSocket,
	MediaStream: class MediaStream {
		private readonly _tracks: MediaStreamTrack[] = [];

		constructor(tracks?: MediaStreamTrack[]) {
			if (tracks) {
				this._tracks = tracks;
			}
		}

		getTracks(): MediaStreamTrack[] {
			return this._tracks;
		}

		addTrack(track: MediaStreamTrack) {
			this._tracks.push(track);
		}
	},
	MediaStreamTrack: class MediaStreamTrack {
		kind: string;
		id: string;

		private static _idCounter = 0;

		constructor() {
			this.id = `track#${fakeGlobals.MediaStreamTrack._idCounter++}`;
		}
	},
	RTCPeerConnection: class RTCPeerConnection {
		private _senders: RTCRtpSender[] = [];

		close() {}

		addTrack(track: MediaStreamTrack, ..._stream: MediaStream[]): RTCRtpSender {
			const newSender = new RTCRtpSender();
			newSender.replaceTrack(track);

			this._senders.push(newSender);

			return newSender;
		}

		// removeTrack(_: RTCRtpSender): void { }

		getSenders(): RTCRtpSender[] {
			return this._senders;
		}
	},
	RTCRtpSender: class RTCRtpSender {
		readonly dtmf: RTCDTMFSender | null;
		readonly rtcpTransport: RTCDtlsTransport | null;
		track: MediaStreamTrack | null;
		readonly transport: RTCDtlsTransport | null;

		replaceTrack(withTrack: MediaStreamTrack | null): Promise<void> {
			this.track = withTrack;

			return Promise.resolve();
		}
	},
};

Object.assign(global, fakeGlobals);
Object.assign(window, fakeGlobals);



================================================
FILE: __test__/logger.spec.ts
================================================
import Logger, { LogLevel } from "../lib/logger";
import { expect, beforeAll, afterAll, describe, it } from "@jest/globals";

describe("Logger", () => {
	let oldLoggerPrint;
	beforeAll(() => {
		//@ts-ignore
		oldLoggerPrint = Logger._print;
	});

	it("should be disabled by default", () => {
		expect(Logger.logLevel).toBe(LogLevel.Disabled);
	});

	it("should be accept new log level", () => {
		const checkedLevels = [];

		Logger.setLogFunction((logLevel) => {
			checkedLevels.push(logLevel);
		});

		Logger.logLevel = LogLevel.Warnings;

		expect(Logger.logLevel).toBe(LogLevel.Warnings);

		Logger.log("");
		Logger.warn("");
		Logger.error("");

		expect(checkedLevels).toEqual([LogLevel.Warnings, LogLevel.Errors]);
	});

	it("should accept new log function", () => {
		Logger.logLevel = LogLevel.All;

		const checkedLevels = [];
		const testMessage = "test it";

		Logger.setLogFunction((logLevel, ...args) => {
			checkedLevels.push(logLevel);

			expect(args[0]).toBe(testMessage);
		});

		Logger.log(testMessage);
		Logger.warn(testMessage);
		Logger.error(testMessage);

		expect(checkedLevels).toEqual([
			LogLevel.All,
			LogLevel.Warnings,
			LogLevel.Errors,
		]);
	});

	afterAll(() => {
		Logger.setLogFunction(oldLoggerPrint);
	});
});



================================================
FILE: __test__/peer.spec.ts
================================================
import "./setup";
import { Peer } from "../lib/peer";
import { Server } from "mock-socket";
import { ConnectionType, PeerErrorType, ServerMessageType } from "../lib/enums";
import { expect, beforeAll, afterAll, describe, it } from "@jest/globals";

const createMockServer = (): Server => {
	const fakeURL = "ws://localhost:8080/peerjs?key=peerjs&id=1&token=testToken";
	const mockServer = new Server(fakeURL);

	mockServer.on("connection", (socket) => {
		//@ts-ignore
		socket.on("message", (data) => {
			socket.send("test message from mock server");
		});

		socket.send(JSON.stringify({ type: ServerMessageType.Open }));
	});

	return mockServer;
};
describe("Peer", () => {
	describe("after construct without parameters", () => {
		it("shouldn't contains any connection", () => {
			const peer = new Peer();

			expect(peer.open).toBe(false);
			expect(peer.connections).toEqual({});
			expect(peer.id).toBeNull();
			expect(peer.disconnected).toBe(false);
			expect(peer.destroyed).toBe(false);

			peer.destroy();
		});
	});

	describe("after construct with parameters", () => {
		it("should contains id and key", () => {
			const peer = new Peer("1", { key: "anotherKey" });

			expect(peer.id).toBe("1");
			expect(peer.options.key).toBe("anotherKey");

			peer.destroy();
		});
	});

	describe.skip("after call to peer #2", () => {
		let mockServer;

		beforeAll(() => {
			mockServer = createMockServer();
		});

		it("Peer#1 should has id #1", (done) => {
			const peer1 = new Peer("1", { port: 8080, host: "localhost" });
			expect(peer1.open).toBe(false);

			const mediaOptions = {
				metadata: { var: "123" },
				constraints: {
					mandatory: {
						OfferToReceiveAudio: true,
						OfferToReceiveVideo: true,
					},
				},
			};

			const track = new MediaStreamTrack();
			const mediaStream = new MediaStream([track]);

			const mediaConnection = peer1.call("2", mediaStream, { ...mediaOptions });

			expect(typeof mediaConnection.connectionId).toBe("string");
			expect(mediaConnection.type).toBe(ConnectionType.Media);
			expect(mediaConnection.peer).toBe("2");
			expect(mediaConnection.options).toEqual(
				// expect.arrayContaining([mediaOptions]),mediaOptions
				expect.objectContaining(mediaOptions),
			);
			expect(mediaConnection.metadata).toEqual(mediaOptions.metadata);
			expect(mediaConnection.peerConnection.getSenders()[0].track.id).toBe(
				track.id,
			);

			peer1.once("open", (id) => {
				expect(id).toBe("1");
				//@ts-ignore
				expect(peer1._lastServerId).toBe("1");
				expect(peer1.disconnected).toBe(false);
				expect(peer1.destroyed).toBe(false);
				expect(peer1.open).toBe(true);

				peer1.destroy();

				expect(peer1.disconnected).toBe(true);
				expect(peer1.destroyed).toBe(true);
				expect(peer1.open).toBe(false);
				expect(peer1.connections).toEqual({});

				done();
			});
		});

		afterAll(() => {
			mockServer.stop();
		});
	});

	describe("reconnect", () => {
		let mockServer;

		beforeAll(() => {
			mockServer = createMockServer();
		});

		it("connect to server => disconnect => reconnect => destroy", (done) => {
			const peer1 = new Peer("1", { port: 8080, host: "localhost" });

			peer1.once("open", () => {
				expect(peer1.open).toBe(true);

				peer1.once("disconnected", () => {
					expect(peer1.disconnected).toBe(true);
					expect(peer1.destroyed).toBe(false);
					expect(peer1.open).toBe(false);

					peer1.once("open", (id) => {
						expect(id).toBe("1");
						expect(peer1.disconnected).toBe(false);
						expect(peer1.destroyed).toBe(false);
						expect(peer1.open).toBe(true);

						peer1.once("disconnected", () => {
							expect(peer1.disconnected).toBe(true);
							expect(peer1.destroyed).toBe(false);
							expect(peer1.open).toBe(false);

							peer1.once("close", () => {
								expect(peer1.disconnected).toBe(true);
								expect(peer1.destroyed).toBe(true);
								expect(peer1.open).toBe(false);

								done();
							});
						});

						peer1.destroy();
					});

					peer1.reconnect();
				});

				peer1.disconnect();
			});
		});

		it("disconnect => reconnect => destroy", (done) => {
			mockServer.stop();

			const peer1 = new Peer("1", { port: 8080, host: "localhost" });

			peer1.once("disconnected", (id) => {
				expect(id).toBe("1");
				expect(peer1.disconnected).toBe(true);
				expect(peer1.destroyed).toBe(false);
				expect(peer1.open).toBe(false);

				peer1.once("open", (id) => {
					expect(id).toBe("1");
					expect(peer1.disconnected).toBe(false);
					expect(peer1.destroyed).toBe(false);
					expect(peer1.open).toBe(true);

					peer1.once("disconnected", () => {
						expect(peer1.disconnected).toBe(true);
						expect(peer1.destroyed).toBe(false);
						expect(peer1.open).toBe(false);

						peer1.once("close", () => {
							expect(peer1.disconnected).toBe(true);
							expect(peer1.destroyed).toBe(true);
							expect(peer1.open).toBe(false);

							done();
						});
					});

					peer1.destroy();
				});

				mockServer = createMockServer();

				peer1.reconnect();
			});
		});

		it("destroy peer if no id and no connection", (done) => {
			mockServer.stop();

			const peer1 = new Peer({ port: 8080, host: "localhost" });

			peer1.once("error", (error) => {
				expect(error.type).toBe(PeerErrorType.ServerError);

				peer1.once("close", () => {
					expect(peer1.disconnected).toBe(true);
					expect(peer1.destroyed).toBe(true);
					expect(peer1.open).toBe(false);

					done();
				});

				mockServer = createMockServer();
			});
		});

		afterAll(() => {
			mockServer.stop();
		});
	});
});



================================================
FILE: __test__/setup.ts
================================================
import "./faker";
import { util } from "../lib/util";

//enable support for WebRTC
util.supports.audioVideo = true;
util.randomToken = () => "testToken";



================================================
FILE: __test__/util.spec.ts
================================================
import "./setup";
import { util } from "../lib/util";
import { expect, describe, it } from "@jest/globals";

describe("util", () => {
	describe("#chunkedMTU", () => {
		it("should be 16300", () => {
			expect(util.chunkedMTU).toBe(16300);
		});
	});
});



================================================
FILE: e2e/alice.html
================================================
<html>
	<head>
		<title>Alice</title>
	</head>
</html>



================================================
FILE: e2e/bob.html
================================================
<html>
	<head>
		<title>Bob</title>
	</head>
</html>



================================================
FILE: e2e/commit_data.js
================================================
export const commit_data = [
	{
		created_at: "2013-11-07T19:41:25-08:00",
		payload: { issue_id: 22111847, comment_id: 28032260 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs/issues/101#issuecomment-28032260",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-11-07T19:35:50-08:00",
		payload: { issue_id: 22196839, comment_id: 28031970 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs/issues/103#issuecomment-28031970",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-11-02T15:18:51-07:00",
		payload: {
			ref: "0.3.3",
			ref_type: "tag",
			master_branch: "master",
			description: "Peer-to-peer data in the browser.",
		},
		public: true,
		type: "CreateEvent",
		url: "https://github.com/peers/peerjs/tree/0.3.3",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-11-02T15:18:49-07:00",
		payload: {
			shas: [
				[
					"9976990c61c0f9c3c44f1de2a997ff8f21013d2a",
					"really.ez@gmail.com",
					"Bump to 0.3.3",
					"ericz",
					true,
				],
			],
			size: 1,
			ref: "refs/heads/master",
			head: "9976990c61c0f9c3c44f1de2a997ff8f21013d2a",
		},
		public: true,
		type: "PushEvent",
		url: "https://github.com/peers/peerjs/compare/c9adf5076e...9976990c61",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-11-02T15:15:18-07:00",
		payload: {
			shas: [
				[
					"ec1424c0f264ea5d8ce08ac2cc9ea2bd027a6a71",
					"really.ez@gmail.com",
					"Errant comma",
					"ericz",
					true,
				],
				[
					"c9adf5076ea41df60231e11d032f371939228609",
					"really.ez@gmail.com",
					"Dont throw exception on failures",
					"ericz",
					true,
				],
			],
			size: 2,
			ref: "refs/heads/master",
			head: "c9adf5076ea41df60231e11d032f371939228609",
		},
		public: true,
		type: "PushEvent",
		url: "https://github.com/peers/peerjs/compare/bb1045bf92...c9adf5076e",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-11-02T15:02:02-07:00",
		payload: {
			shas: [
				[
					"bb1045bf92fbaef6e2156c3ac47015f70af5d866",
					"really.ez@gmail.com",
					"Fix errant comma",
					"ericz",
					true,
				],
			],
			size: 1,
			ref: "refs/heads/master",
			head: "bb1045bf92fbaef6e2156c3ac47015f70af5d866",
		},
		public: true,
		type: "PushEvent",
		url: "https://github.com/peers/peerjs/compare/2db1c59998...bb1045bf92",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-11-02T14:56:14-07:00",
		payload: {
			shas: [
				[
					"2db1c599987753079d197f73272a9e40e9290f73",
					"really.ez@gmail.com",
					"Remove errant comma",
					"ericz",
					true,
				],
			],
			size: 1,
			ref: "refs/heads/master",
			head: "2db1c599987753079d197f73272a9e40e9290f73",
		},
		public: true,
		type: "PushEvent",
		url: "https://github.com/peers/peerjs/compare/214a14cc10...2db1c59998",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-11-02T14:56:13-07:00",
		payload: {
			shas: [
				[
					"841921c349aff234b022bb966774d00ae22fef5e",
					"really.ez@gmail.com",
					"Errant comma",
					"ericz",
					true,
				],
			],
			size: 1,
			ref: "refs/heads/better-supports",
			head: "841921c349aff234b022bb966774d00ae22fef5e",
		},
		public: true,
		type: "PushEvent",
		url: "https://github.com/peers/peerjs/compare/ccd80612ae...841921c349",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-11-01T11:41:34-07:00",
		payload: {
			shas: [
				[
					"37350aaef3763d5a1bc63c4903f0f34ea9780d36",
					"really.ez@gmail.com",
					"Fix",
					"Eric Zhang",
					true,
				],
			],
			size: 1,
			ref: "refs/heads/master",
			head: "37350aaef3763d5a1bc63c4903f0f34ea9780d36",
		},
		public: true,
		type: "PushEvent",
		url: "https://github.com/HackBerkeley/ascam/compare/7d76223acc...37350aaef3",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 5557070,
			name: "ascam",
			url: "https://github.com/HackBerkeley/ascam",
			description: "Ascii Webcam",
			homepage: "",
			watchers: 1,
			stargazers: 1,
			forks: 1,
			fork: true,
			size: 1973,
			owner: "HackBerkeley",
			private: false,
			open_issues: 0,
			has_issues: false,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-08-25T20:19:01-07:00",
			pushed_at: "2013-11-01T11:41:33-07:00",
			master_branch: "master",
			organization: "HackBerkeley",
		},
	},
	{
		created_at: "2013-10-31T10:56:20-07:00",
		payload: { issue_id: 13813188, comment_id: 27509702 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs/pull/45#issuecomment-27509702",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-26T22:53:49-07:00",
		payload: { issue_id: 21646195, comment_id: 27163465 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs-server/issues/25#issuecomment-27163465",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7452705,
			name: "peerjs-server",
			url: "https://github.com/peers/peerjs-server",
			description: "Server for PeerJS",
			homepage: "https://peerjs.com",
			watchers: 328,
			stargazers: 328,
			forks: 56,
			fork: false,
			size: 389,
			owner: "peers",
			private: false,
			open_issues: 12,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2013-01-04T22:49:08-08:00",
			pushed_at: "2013-10-24T00:40:28-07:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-25T11:04:07-07:00",
		payload: { action: "closed", issue: 16608955, number: 68 },
		public: true,
		type: "IssuesEvent",
		url: "https://github.com/peers/peerjs/issues/68",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-25T11:02:50-07:00",
		payload: { issue_id: 21379154, comment_id: 27113277 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs/issues/91#issuecomment-27113277",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-25T11:01:53-07:00",
		payload: { action: "closed", issue: 21531959, number: 96 },
		public: true,
		type: "IssuesEvent",
		url: "https://github.com/peers/peerjs/issues/96",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-25T11:01:25-07:00",
		payload: { issue_id: 21379154, comment_id: 27113184 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs/issues/91#issuecomment-27113184",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-25T10:42:32-07:00",
		payload: { issue_id: 21531959, comment_id: 27111740 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs/issues/96#issuecomment-27111740",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-25T10:42:13-07:00",
		payload: { issue_id: 21531959, comment_id: 27111710 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs/issues/96#issuecomment-27111710",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-25T10:36:48-07:00",
		payload: { issue_id: 21568882, comment_id: 27111312 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs/issues/97#issuecomment-27111312",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-23T15:52:46-07:00",
		payload: { issue_id: 21487688, comment_id: 26953214 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs/issues/95#issuecomment-26953214",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-22T20:07:24-07:00",
		payload: { action: "opened", issue: 21431237, number: 93 },
		public: true,
		type: "IssuesEvent",
		url: "https://github.com/peers/peerjs/issues/93",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-22T19:15:46-07:00",
		payload: { issue_id: 21259595, comment_id: 26875922 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs/issues/89#issuecomment-26875922",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-22T19:06:59-07:00",
		payload: { issue_id: 20917093, comment_id: 26875655 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs/issues/86#issuecomment-26875655",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-22T10:42:17-07:00",
		payload: { issue_id: 21337614, comment_id: 26824752 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs/issues/90#issuecomment-26824752",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-21T21:00:18-07:00",
		payload: { issue_id: 21337614, comment_id: 26775684 },
		public: true,
		type: "IssueCommentEvent",
		url: "https://github.com/peers/peerjs/issues/90#issuecomment-26775684",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-19T02:06:52-07:00",
		payload: {
			ref: "0.3.1",
			ref_type: "tag",
			master_branch: "master",
			description: "Peer-to-peer data in the browser.",
		},
		public: true,
		type: "CreateEvent",
		url: "https://github.com/peers/peerjs/tree/0.3.1",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-19T02:06:43-07:00",
		payload: { ref: "0.3.1", ref_type: "tag" },
		public: true,
		type: "DeleteEvent",
		url: "https://github.com/",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-19T02:05:42-07:00",
		payload: {
			shas: [
				[
					"720eb3e881220f78eaca3d715ce7afe9324d1a3e",
					"really.ez@gmail.com",
					"0.3.1",
					"ericz",
					true,
				],
				[
					"79e10688c56524479f3b2c0cb069c4ac7e065b57",
					"really.ez@gmail.com",
					"Set maxRetransmits to 0 when reliable false",
					"ericz",
					true,
				],
			],
			size: 2,
			ref: "refs/heads/master",
			head: "79e10688c56524479f3b2c0cb069c4ac7e065b57",
		},
		public: true,
		type: "PushEvent",
		url: "https://github.com/peers/peerjs/compare/b474a4cba6...79e10688c5",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-19T02:02:15-07:00",
		payload: {
			ref: "0.3.1",
			ref_type: "tag",
			master_branch: "master",
			description: "Peer-to-peer data in the browser.",
		},
		public: true,
		type: "CreateEvent",
		url: "https://github.com/peers/peerjs/tree/0.3.1",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-19T02:02:13-07:00",
		payload: {
			shas: [
				[
					"b474a4cba6156dabd1312cd25a520b4286e362f6",
					"really.ez@gmail.com",
					"Setting reliable to false by default",
					"ericz",
					true,
				],
			],
			size: 1,
			ref: "refs/heads/master",
			head: "b474a4cba6156dabd1312cd25a520b4286e362f6",
		},
		public: true,
		type: "PushEvent",
		url: "https://github.com/peers/peerjs/compare/93fc4931b2...b474a4cba6",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
	{
		created_at: "2013-10-19T01:53:16-07:00",
		payload: {
			shas: [
				[
					"3949c236345171987b9291059fbaf9024eeca680",
					"really.ez@gmail.com",
					"0.3.1",
					"ericz",
					true,
				],
				[
					"93fc4931b24c0261c5fda71e0441a5ee8bda70b2",
					"really.ez@gmail.com",
					"Update reliable doc",
					"ericz",
					true,
				],
			],
			size: 2,
			ref: "refs/heads/master",
			head: "93fc4931b24c0261c5fda71e0441a5ee8bda70b2",
		},
		public: true,
		type: "PushEvent",
		url: "https://github.com/peers/peerjs/compare/cd287e2fae...93fc4931b2",
		actor: "ericz",
		actor_attributes: {
			login: "ericz",
			type: "User",
			gravatar_id: "c584ef7fe434331f7068ea49cacd88b9",
			name: "Eric Zhang",
			company: "Lever",
			blog: "https://twitter.com/reallyez",
			location: "Berkeley",
			email: "eric@ericzhang.com",
		},
		repository: {
			id: 7292898,
			name: "peerjs",
			url: "https://github.com/peers/peerjs",
			description: "Peer-to-peer data in the browser.",
			homepage: "https://peerjs.com",
			watchers: 1647,
			stargazers: 1647,
			forks: 145,
			fork: false,
			size: 2188,
			owner: "peers",
			private: false,
			open_issues: 20,
			has_issues: true,
			has_downloads: true,
			has_wiki: true,
			language: "JavaScript",
			created_at: "2012-12-22T23:28:47-08:00",
			pushed_at: "2013-11-09T22:58:31-08:00",
			master_branch: "master",
			organization: "peers",
		},
	},
];



================================================
FILE: e2e/data.js
================================================
export const numbers = [
	0,
	1,
	-1,
	//
	Math.PI,
	-Math.PI,
	//8 bit
	0x7f,
	0x0f,
	//16 bit
	0x7fff,
	0x0fff,
	//32 bit
	0x7fffffff,
	0x0fffffff,
	//64 bit
	// 0x7FFFFFFFFFFFFFFF,
	// eslint-disable-next-line no-loss-of-precision
	0x0fffffffffffffff,
];
export const long_string = "ThisIsÁTèstString".repeat(100000);
export const strings = [
	"",
	"hello",
	"café",
	"中文",
	"broccoli🥦līp𨋢grin😃ok",
	"\u{10ffff}",
];

export { commit_data } from "./commit_data.js";

export const uint8_arrays = [
	new Uint8Array(),
	new Uint8Array([0]),
	new Uint8Array([0, 1, 2, 3, 4, 6, 7]),
	new Uint8Array([0, 1, 2, 3, 4, 6, 78, 9, 10, 11, 12, 13, 14, 15]),
	new Uint8Array([
		0, 1, 2, 3, 4, 6, 78, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23,
		24, 25, 26, 27, 28, 30, 31,
	]),
];

export const int32_arrays = [
	new Int32Array([0].map((x) => -x)),
	new Int32Array([0, 1, 2, 3, 4, 6, 7].map((x) => -x)),
	new Int32Array(
		[0, 1, 2, 3, 4, 6, 78, 9, 10, 11, 12, 13, 14, 15].map((x) => -x),
	),
	new Int32Array(
		[
			0, 1, 2, 3, 4, 6, 78, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22,
			23, 24, 25, 26, 27, 28, 30, 31,
		].map((x) => -x),
	),
];

export const typed_array_view = new Uint8Array(uint8_arrays[4].buffer, 4);

export const array_buffers = [
	new Uint8Array(),
	new Uint8Array([0]),
	new Uint8Array([0, 1, 2, 3, 4, 6, 7]),
	new Uint8Array([0, 1, 2, 3, 4, 6, 78, 9, 10, 11, 12, 13, 14, 15]),
	new Uint8Array([
		0, 1, 2, 3, 4, 6, 78, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23,
		24, 25, 26, 27, 28, 30, 31,
	]),
].map((x) => x.buffer);

export const dates = [
	new Date(Date.UTC(2024, 1, 1, 1, 1, 1, 1)),
	new Date(Date.UTC(1, 1, 1, 1, 1, 1, 1)),
];



================================================
FILE: e2e/package.json
================================================
{
	"type": "module"
}



================================================
FILE: e2e/style.css
================================================
body {
	font-family: Arial, sans-serif;
	max-width: 800px;
	margin: 0 auto;
	padding: 20px;
}

#inputs {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	align-items: center;
}

button {
	background-color: #007bff;
	color: white;
	border: none;
	padding: 8px 16px;
	border-radius: 4px;
	cursor: pointer;
}

button:hover {
	background-color: #0056b3;
}



================================================
FILE: e2e/tsconfig.json
================================================
{
	"compilerOptions": {
		/* Visit https://aka.ms/tsconfig.json to read more about this file */

		/* Basic Options */
		// "incremental": true,                   /* Enable incremental compilation */
		"target": "ES2022" /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', or 'ESNEXT'. */,
		"module": "ESNext" /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', 'es2020', or 'ESNext'. */,
		// "lib": [],                             /* Specify library files to be included in the compilation. */
		// "allowJs": true,                       /* Allow javascript files to be compiled. */
		// "checkJs": true,                       /* Report errors in .js files. */
		// "jsx": "preserve",                     /* Specify JSX code generation: 'preserve', 'react-native', or 'react'. */
		// "declaration": true,                   /* Generates corresponding '.d.ts' file. */
		// "declarationMap": true,                /* Generates a sourcemap for each corresponding '.d.ts' file. */
		// "sourceMap": true,                     /* Generates corresponding '.map' file. */
		// "outFile": "./",                       /* Concatenate and emit output to single file. */
		// "outDir": "./",                        /* Redirect output structure to the directory. */
		// "rootDir": "./",                       /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
		// "composite": true,                     /* Enable project compilation */
		// "tsBuildInfoFile": "./",               /* Specify file to store incremental compilation information */
		// "removeComments": true,                /* Do not emit comments to output. */
		// "noEmit": true,                        /* Do not emit outputs. */
		// "importHelpers": true,                 /* Import emit helpers from 'tslib'. */
		// "downlevelIteration": true,            /* Provide full support for iterables in 'for-of', spread, and destructuring when targeting 'ES5' or 'ES3'. */
		// "isolatedModules": true,               /* Transpile each file as a separate module (similar to 'ts.transpileModule'). */

		/* Strict Type-Checking Options */
		"strict": true /* Enable all strict type-checking options. */,
		// "noImplicitAny": true,                 /* Raise error on expressions and declarations with an implied 'any' type. */
		// "strictNullChecks": true,              /* Enable strict null checks. */
		// "strictFunctionTypes": true,           /* Enable strict checking of function types. */
		// "strictBindCallApply": true,           /* Enable strict 'bind', 'call', and 'apply' methods on functions. */
		// "strictPropertyInitialization": true,  /* Enable strict checking of property initialization in classes. */
		// "noImplicitThis": true,                /* Raise error on 'this' expressions with an implied 'any' type. */
		// "alwaysStrict": true,                  /* Parse in strict mode and emit "use strict" for each source file. */

		/* Additional Checks */
		// "noUnusedLocals": true,                /* Report errors on unused locals. */
		// "noUnusedParameters": true,            /* Report errors on unused parameters. */
		// "noImplicitReturns": true,             /* Report error when not all code paths in function return a value. */
		// "noFallthroughCasesInSwitch": true,    /* Report errors for fallthrough cases in switch statement. */
		// "noUncheckedIndexedAccess": true,      /* Include 'undefined' in index signature results */

		/* Module Resolution Options */
		"moduleResolution": "node" /* Specify module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6). */,
		// "baseUrl": "./",                       /* Base directory to resolve non-absolute module names. */
		// "paths": {},                           /* A series of entries which re-map imports to lookup locations relative to the 'baseUrl'. */
		// "rootDirs": [],                        /* List of root folders whose combined content represents the structure of the project at runtime. */
		// "typeRoots": [],                       /* List of folders to include type definitions from. */
		"types": [
			"node",
			"@wdio/globals/types",
			"jasmine",
			"@wdio/jasmine-framework"
		],
		"allowSyntheticDefaultImports": true /* Allow default imports from modules with no default export. This does not affect code emit, just typechecking. */,
		// "esModuleInterop": true,               /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */
		// "preserveSymlinks": true,              /* Do not resolve the real path of symlinks. */
		// "allowUmdGlobalAccess": true,          /* Allow accessing UMD globals from modules. */

		/* Source Map Options */
		// "sourceRoot": "",                      /* Specify the location where debugger should locate TypeScript files instead of source locations. */
		// "mapRoot": "",                         /* Specify the location where debugger should locate map files instead of generated locations. */
		// "inlineSourceMap": true,               /* Emit a single file with source maps instead of having a separate file. */
		// "inlineSources": true,                 /* Emit the source alongside the sourcemaps within a single file; requires '--inlineSourceMap' or '--sourceMap' to be set. */

		/* Experimental Options */
		// "experimentalDecorators": true,        /* Enables experimental support for ES7 decorators. */
		// "emitDecoratorMetadata": true,         /* Enables experimental support for emitting type metadata for decorators. */

		/* Advanced Options */
		"skipLibCheck": true /* Skip type checking of declaration files. */,
		"forceConsistentCasingInFileNames": true /* Disallow inconsistently-cased references to the same file. */
	}
}



================================================
FILE: e2e/types.d.ts
================================================
/* eslint no-unused-vars: 0 */

declare module "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs" {
	export = chai;
}

interface Window {
	"connect-btn": HTMLButtonElement;
	send: (dataConnection: import("../../peerjs").DataConnection) => void;
	check: (received: unknown[]) => void;
}



================================================
FILE: e2e/wdio.bstack.conf.ts
================================================
import { config as sharedConfig } from "./wdio.shared.conf.js";

export const config: WebdriverIO.Config = {
	...sharedConfig,
	...{
		maxInstances: 5,
		user: process.env.BROWSERSTACK_USERNAME,
		key: process.env.BROWSERSTACK_ACCESS_KEY,
		hostname: "hub.browserstack.com",
		services: [
			[
				"browserstack",
				{
					browserstackLocal: true,
				},
			],
		],
		capabilities: [
			{
				browserName: "Edge",
				"bstack:options": {
					os: "Windows",
					osVersion: "11",
					browserVersion: "83",
					localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
				},
			},
			{
				browserName: "Chrome",
				"bstack:options": {
					os: "Windows",
					osVersion: "11",
					browserVersion: "83",
					localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
				},
			},
			{
				browserName: "Chrome",
				"bstack:options": {
					browserVersion: "latest",
					os: "Windows",
					osVersion: "11",
					localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
				},
			},
			{
				browserName: "Firefox",
				"bstack:options": {
					os: "Windows",
					osVersion: "7",
					browserVersion: "80.0",
					localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
				},
			},
			{
				browserName: "Firefox",
				"bstack:options": {
					browserVersion: "105",
					os: "OS X",
					osVersion: "Ventura",
					localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
				},
			},
			// {
			//     browserName: "Safari",
			//     "bstack:options": {
			//         browserVersion: "latest",
			//         os: "OS X",
			//         osVersion: "Monterey",
			//         localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
			//     },
			// },
			// {
			//     browserName: 'Safari',
			//     'bstack:options': {
			//         browserVersion: 'latest',
			//         os: 'OS X',
			//         osVersion: 'Ventura',
			//         localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
			//     }
			// },
		],
	},
};



================================================
FILE: e2e/wdio.local.conf.ts
================================================
import { config as sharedConfig } from "./wdio.shared.conf.js";

export const config: WebdriverIO.Config = {
	runner: "local",
	...sharedConfig,
	services: ["geckodriver"],
	...{
		capabilities: [
			{
				browserName: "chrome",
				"goog:chromeOptions": {
					args: ["headless", "disable-gpu"],
				},
			},
			{
				browserName: "firefox",
				"moz:firefoxOptions": {
					args: ["-headless"],
				},
			},
		],
	},
};



================================================
FILE: e2e/wdio.shared.conf.ts
================================================
import url from "node:url";
import path from "node:path";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export const config: Omit<WebdriverIO.Config, "capabilities"> = {
	injectGlobals: false,
	//
	// ====================
	// Runner Configuration
	// ====================
	//
	// WebdriverIO allows it to run your tests in arbitrary locations (e.g. locally or
	// on a remote machine).
	// runner: 'local',
	//
	// ==================
	// Specify Test Files
	// ==================
	// Define which test specs should run. The pattern is relative to the directory
	// from which `wdio` was called. Notice that, if you are calling `wdio` from an
	// NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
	// directory is where your package.json resides, so `wdio` will be called from there.
	//
	specs: ["./**/*.spec.ts"],
	// Patterns to exclude.
	exclude: [
		// 'path/to/excluded/files'
	],
	//
	// ============
	// Capabilities
	// ============
	// Define your capabilities here. WebdriverIO can run multiple capabilities at the same
	// time. Depending on the number of capabilities, WebdriverIO launches several test
	// sessions. Within your capabilities you can overwrite the spec and exclude options in
	// order to group specific specs to a specific capability.
	//
	// First, you can define how many instances should be started at the same time. Let's
	// say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
	// set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
	// files and you set maxInstances to 10, all spec files will get tested at the same time
	// and 30 processes will get spawned. The property handles how many capabilities
	// from the same test should run tests.
	//
	maxInstances: 5,
	//
	// ===================
	// Test Configurations
	// ===================
	// Define all options that are relevant for the WebdriverIO instance here
	//
	// Level of logging verbosity: trace | debug | info | warn | error | silent
	logLevel: "trace",
	outputDir: path.resolve(__dirname, "logs"),
	//
	// Set specific log levels per logger
	// loggers:
	// - webdriver, webdriverio
	// - @wdio/applitools-service, @wdio/browserstack-service, @wdio/devtools-service, @wdio/sauce-service
	// - @wdio/mocha-framework, @wdio/jasmine-framework
	// - @wdio/local-runner, @wdio/lambda-runner
	// - @wdio/sumologic-reporter
	// - @wdio/cli, @wdio/config, @wdio/sync, @wdio/utils
	// Level of logging verbosity: trace | debug | info | warn | error | silent
	// logLevels: {
	//     webdriver: 'info',
	//     '@wdio/applitools-service': 'info'
	// },
	//
	// If you only want to run your tests until a specific amount of tests have failed use
	// bail (default is 0 - don't bail, run all tests).
	bail: 0,
	//
	// Set a base URL in order to shorten url command calls. If your `url` parameter starts
	// with `/`, the base url gets prepended, not including the path portion of your baseUrl.
	// If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
	// gets prepended directly.
	baseUrl: "http://localhost:3000",
	//
	// Default timeout for all waitFor* commands.
	waitforTimeout: 10000,
	//
	// Default timeout in milliseconds for request
	// if browser driver or grid doesn't send response
	connectionRetryTimeout: 90000,
	//
	// Default request retries count
	connectionRetryCount: 3,
	//
	// Framework you want to run your specs with.
	// The following are supported: Mocha, Jasmine, and Cucumber
	// see also: https://webdriver.io/docs/frameworks.html
	//
	// Make sure you have the wdio adapter package for the specific framework installed
	// before running any tests.
	framework: "jasmine",
	//
	// The number of times to retry the entire specfile when it fails as a whole
	specFileRetries: 1,
	//
	// Whether or not retried specfiles should be retried immediately or deferred to the end of the queue
	specFileRetriesDeferred: true,
	//
	// Test reporter for stdout.
	// The only one supported by default is 'dot'
	// see also: https://webdriver.io/docs/dot-reporter.html
	reporters: ["spec"],
	//
	// Options to be passed to Jasmine.
	jasmineOpts: {
		// Jasmine default timeout
		defaultTimeoutInterval: 60000,
		//
		// The Jasmine framework allows interception of each assertion in order to log the state of the application
		// or website depending on the result. For example, it is pretty handy to take a screenshot every time
		// an assertion fails.
		// expectationResultHandler: function(passed, assertion) {
		// do something
		// }
	},
	//
	// =====
	// Hooks
	// =====
	// WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
	// it and to build services around it. You can either apply a single function or an array of
	// methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
	// resolved to continue.
	/**
	 * Gets executed once before all workers get launched.
	 * @param {Object} config wdio configuration object
	 * @param {Array.<Object>} capabilities list of capabilities details
	 */
	// onPrepare: function (config, capabilities) {
	// },
	/**
	 * Gets executed before a worker process is spawned and can be used to initialise specific service
	 * for that worker as well as modify runtime environments in an async fashion.
	 * @param  {String} cid      capability id (e.g 0-0)
	 * @param  {[type]} caps     object containing capabilities for session that will be spawn in the worker
	 * @param  {[type]} specs    specs to be run in the worker process
	 * @param  {[type]} args     object that will be merged with the main configuration once worker is initialised
	 * @param  {[type]} execArgv list of string arguments passed to the worker process
	 */
	// onWorkerStart: function (cid, caps, specs, args, execArgv) {
	// },
	/**
	 * Gets executed just before initialising the webdriver session and test framework. It allows you
	 * to manipulate configurations depending on the capability or spec.
	 * @param {Object} config wdio configuration object
	 * @param {Array.<Object>} capabilities list of capabilities details
	 * @param {Array.<String>} specs List of spec file paths that are to be run
	 */
	// beforeSession: function (config, capabilities, specs) {
	// },
	/**
	 * Gets executed before test execution begins. At this point you can access to all global
	 * variables like `browser`. It is the perfect place to define custom commands.
	 * @param {Array.<Object>} capabilities list of capabilities details
	 * @param {Array.<String>} specs List of spec file paths that are to be run
	 */
	// before: function (capabilities, specs) {
	// },
	/**
	 * Runs before a WebdriverIO command gets executed.
	 * @param {String} commandName hook command name
	 * @param {Array} args arguments that command would receive
	 */
	// beforeCommand: function (commandName, args) {
	// },
	/**
	 * Hook that gets executed before the suite starts
	 * @param {Object} suite suite details
	 */
	// beforeSuite: function (suite) {
	// },
	/**
	 * Function to be executed before a test (in Mocha/Jasmine) starts.
	 */
	// beforeTest: function (test, context) {
	// },
	/**
	 * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
	 * beforeEach in Mocha)
	 */
	// beforeHook: function (test, context) {
	// },
	/**
	 * Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
	 * afterEach in Mocha)
	 */
	// afterHook: function (test, context, { error, result, duration, passed, retries }) {
	// },
	/**
	 * Function to be executed after a test (in Mocha/Jasmine).
	 */
	// afterTest: function(test, context, { error, result, duration, passed, retries }) {
	// },

	/**
	 * Hook that gets executed after the suite has ended
	 * @param {Object} suite suite details
	 */
	// afterSuite: function (suite) {
	// },
	/**
	 * Runs after a WebdriverIO command gets executed
	 * @param {String} commandName hook command name
	 * @param {Array} args arguments that command would receive
	 * @param {Number} result 0 - command success, 1 - command error
	 * @param {Object} error error object if any
	 */
	// afterCommand: function (commandName, args, result, error) {
	// },
	/**
	 * Gets executed after all tests are done. You still have access to all global variables from
	 * the test.
	 * @param {Number} result 0 - test pass, 1 - test fail
	 * @param {Array.<Object>} capabilities list of capabilities details
	 * @param {Array.<String>} specs List of spec file paths that ran
	 */
	// after: function (result, capabilities, specs) {
	// },
	/**
	 * Gets executed right after terminating the webdriver session.
	 * @param {Object} config wdio configuration object
	 * @param {Array.<Object>} capabilities list of capabilities details
	 * @param {Array.<String>} specs List of spec file paths that ran
	 */
	// afterSession: function (config, capabilities, specs) {
	// },
	/**
	 * Gets executed after all workers got shut down and the process is about to exit. An error
	 * thrown in the onComplete hook will result in the test run failing.
	 * @param {Object} exitCode 0 - success, 1 - fail
	 * @param {Object} config wdio configuration object
	 * @param {Array.<Object>} capabilities list of capabilities details
	 * @param {<Object>} results object containing test results
	 */
	// onComplete: function(exitCode, config, capabilities, results) {
	// },
	/**
	 * Gets executed when a refresh happens.
	 * @param {String} oldSessionId session ID of the old session
	 * @param {String} newSessionId session ID of the new session
	 */
	//onReload: function(oldSessionId, newSessionId) {
	//}
};



================================================
FILE: e2e/.eslintrc
================================================
{
	"env": {
		"browser": true
	}
}



================================================
FILE: e2e/datachannel/arraybuffers.js
================================================
import { array_buffers } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	for (const [i, array_buffer] of array_buffers.entries()) {
		expect(received[i]).to.be.an.instanceof(ArrayBuffer);
		expect(received[i]).to.deep.equal(array_buffer);
	}
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	for (const array_buffer of array_buffers) {
		dataConnection.send(array_buffer);
	}
};



================================================
FILE: e2e/datachannel/arraybuffers_as_uint8array.js
================================================
import { array_buffers } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	for (const [i, array_buffer] of array_buffers.entries()) {
		expect(received[i]).to.be.an.instanceof(Uint8Array);
		expect(received[i]).to.deep.equal(new Uint8Array(array_buffer));
	}
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	for (const array_buffer of array_buffers) {
		dataConnection.send(array_buffer);
	}
};



================================================
FILE: e2e/datachannel/arrays.js
================================================
import { commit_data } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	expect(received[1]).to.be.an("array").with.lengthOf(commit_data.length);
	expect(received).to.deep.equal([[], commit_data]);
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	dataConnection.send([]);
	dataConnection.send(commit_data);
};



================================================
FILE: e2e/datachannel/arrays_unchunked.js
================================================
/**
 * JSON transfer does not chunk, commit_data is too large to send
 */

import { commit_data } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	expect(received).to.deep.equal([[], commit_data.slice(0, 2)]);
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	dataConnection.send([]);
	dataConnection.send(commit_data.slice(0, 2));
};



================================================
FILE: e2e/datachannel/blobs.js
================================================
import { commit_data } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

const Encoder = new TextEncoder();
const Decoder = new TextDecoder();

/** @param {unknown[]} received */
export const check = (received) => {
	expect(received).to.be.an("array").with.lengthOf(commit_data.length);
	const commits_as_arraybuffer = commit_data.map(
		(blob) => Encoder.encode(JSON.stringify(blob)).buffer,
	);
	expect(received).to.deep.equal(commits_as_arraybuffer);
	const parsed_received = received.map((r) => JSON.parse(Decoder.decode(r)));
	expect(parsed_received).to.deep.equal(commit_data);
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = async (dataConnection) => {
	for (const commit of commit_data) {
		await dataConnection.send(new Blob([JSON.stringify(commit)]));
	}
};



================================================
FILE: e2e/datachannel/dates.js
================================================
import { dates } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	expect(received).to.deep.equal(dates);
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	for (const date of dates) {
		dataConnection.send(date);
	}
};



================================================
FILE: e2e/datachannel/dates_as_json_string.js
================================================
import { dates } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	console.log(dates.map((date) => date.toString()));
	expect(received).to.deep.equal(dates.map((date) => date.toJSON()));
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	for (const date of dates) {
		dataConnection.send(date);
	}
};



================================================
FILE: e2e/datachannel/dates_as_string.js
================================================
import { dates } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	console.log(dates.map((date) => date.toString()));
	expect(received).to.deep.equal(dates.map((date) => date.toString()));
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	for (const date of dates) {
		dataConnection.send(date);
	}
};



================================================
FILE: e2e/datachannel/files.js
================================================
import { commit_data } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

const Encoder = new TextEncoder();

/** @param {unknown[]} received */
export const check = (received) => {
	expect(received).to.be.an("array").with.lengthOf(commit_data.length);
	const commits_as_arraybuffer = commit_data.map(
		(blob) => Encoder.encode(JSON.stringify(blob)).buffer,
	);
	expect(received).to.deep.equal(commits_as_arraybuffer);
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = async (dataConnection) => {
	for (const commit of commit_data) {
		await dataConnection.send(
			new File([JSON.stringify(commit)], "commit.txt", {
				type: "dummy/data",
			}),
		);
	}
};



================================================
FILE: e2e/datachannel/Int32Array.js
================================================
import { int32_arrays } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	for (const [i, typed_array] of int32_arrays.entries()) {
		expect(received[i]).to.be.an.instanceof(Int32Array);
		expect(received[i]).to.deep.equal(typed_array);
	}
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	for (const typed_array of int32_arrays) {
		dataConnection.send(typed_array);
	}
};



================================================
FILE: e2e/datachannel/Int32Array_as_ArrayBuffer.js
================================================
import { int32_arrays } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	for (const [i, typed_array] of int32_arrays.entries()) {
		expect(received[i]).to.be.an.instanceof(ArrayBuffer);
		expect(new Int32Array(received[i])).to.deep.equal(typed_array);
	}
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	for (const typed_array of int32_arrays) {
		dataConnection.send(typed_array);
	}
};



================================================
FILE: e2e/datachannel/Int32Array_as_Uint8Array.js
================================================
import { int32_arrays } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	for (const [i, typed_array] of int32_arrays.entries()) {
		expect(received[i]).to.be.an.instanceof(Uint8Array);
		expect(received[i]).to.deep.equal(new Uint8Array(typed_array.buffer));
	}
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	for (const typed_array of int32_arrays) {
		dataConnection.send(typed_array);
	}
};



================================================
FILE: e2e/datachannel/long_string.js
================================================
import { long_string } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	expect(received).to.deep.equal([long_string]);
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	dataConnection.send(long_string);
};



================================================
FILE: e2e/datachannel/numbers.js
================================================
import { numbers } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	expect(received).to.deep.equal(numbers);
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	for (const number of numbers) {
		dataConnection.send(number);
	}
};



================================================
FILE: e2e/datachannel/objects.js
================================================
import { commit_data } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	expect(received).to.be.an("array").with.lengthOf(commit_data.length);
	expect(received).to.deep.equal(commit_data);
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	for (const commit of commit_data) {
		dataConnection.send(commit);
	}
};



================================================
FILE: e2e/datachannel/serialization.html
================================================
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title></title>
		<link rel="stylesheet" href="../style.css" />
	</head>
	<body>
		<h1>Serialization</h1>
		<div id="inputs">
			<input type="text" id="receiver-id" placeholder="Receiver ID" />
			<button id="connect-btn" disabled>Connect</button>
			<button id="send-btn">Send</button>
			<button id="check-btn">Check</button>
		</div>
		<div id="messages"></div>
		<div id="result"></div>
		<div id="error-message"></div>
		<script src="/dist/peerjs.min.js" type="application/javascript"></script>
		<script src="serialization.js" type="module"></script>
	</body>
</html>



================================================
FILE: e2e/datachannel/serialization.js
================================================
/**
 * @type {typeof import("../../lib/exports.js").Peer}
 */
const Peer = window.peerjs.Peer;

const params = new URLSearchParams(document.location.search);
const testfile = params.get("testfile");
const serialization = params.get("serialization");

(async () => {
	let serializers = {};
	try {
		const { MsgPack } = await import("/dist/serializer.msgpack.mjs");
		serializers = {
			MsgPack,
		};
	} catch (e) {
		console.log(e);
	}

	const { check, send } = await import(`./${testfile}.js`);
	document.getElementsByTagName("title")[0].innerText =
		window.location.hash.substring(1);

	const checkBtn = document.getElementById("check-btn");
	const sendBtn = document.getElementById("send-btn");
	const receiverIdInput = document.getElementById("receiver-id");
	const connectBtn = document.getElementById("connect-btn");
	const messages = document.getElementById("messages");
	const result = document.getElementById("result");
	const errorMessage = document.getElementById("error-message");

	const peer = new Peer({
		debug: 3,
		serializers,
		key: params.get("key"),
	});
	const received = [];
	/**
	 * @type {import("../../lib/exports.js").DataConnection}
	 */
	let dataConnection;
	peer
		.once("open", (id) => {
			messages.textContent = `Your Peer ID: ${id}`;
		})
		.once("error", (error) => {
			errorMessage.textContent = JSON.stringify(error);
		})
		.once("connection", (connection) => {
			dataConnection = connection;
			dataConnection.on("data", (data) => {
				console.log(data);
				received.push(data);
			});
			dataConnection.once("close", () => {
				messages.textContent = "Closed!";
			});
		});

	connectBtn.addEventListener("click", () => {
		const receiverId = receiverIdInput.value;
		if (receiverId) {
			dataConnection = peer.connect(receiverId, {
				reliable: true,
				serialization,
			});
			dataConnection.once("open", () => {
				messages.textContent = "Connected!";
			});
		}
	});

	checkBtn.addEventListener("click", async () => {
		try {
			console.log(received);
			check(received);
			result.textContent = "Success!";
		} catch (e) {
			result.textContent = "Failed!";
			errorMessage.textContent = JSON.stringify(e.message);
		} finally {
			messages.textContent = "Checked!";
		}
	});

	sendBtn.addEventListener("click", async () => {
		dataConnection.once("error", (err) => {
			errorMessage.innerText = err.toString();
		});
		await send(dataConnection);
		dataConnection.close({ flush: true });
		messages.textContent = "Sent!";
	});
	window["connect-btn"].disabled = false;
})();



================================================
FILE: e2e/datachannel/serialization.page.ts
================================================
import { browser, $ } from "@wdio/globals";

const { BYPASS_WAF } = process.env;

class SerializationPage {
	get sendBtn() {
		return $("button[id='send-btn']");
	}

	get checkBtn() {
		return $("button[id='check-btn']");
	}
	get connectBtn() {
		return $("button[id='connect-btn']");
	}

	get receiverId() {
		return $("input[id='receiver-id']");
	}

	get messages() {
		return $("div[id='messages']");
	}

	get errorMessage() {
		return $("div[id='error-message']");
	}

	get result() {
		return $("div[id='result']");
	}

	waitForMessage(right: string) {
		return browser.waitUntil(
			async () => {
				const messages = await this.messages.getText();
				return messages.startsWith(right);
			},
			{ timeoutMsg: `Expected message to start with ${right}`, timeout: 10000 },
		);
	}

	async open(testFile: string, serialization: string) {
		await browser.switchWindow("Alice");
		await browser.url(
			`/e2e/datachannel/serialization.html?testfile=${testFile}&serialization=${serialization}&key=${BYPASS_WAF}#Alice`,
		);
		await this.connectBtn.waitForEnabled();

		await browser.switchWindow("Bob");
		await browser.url(
			`/e2e/datachannel/serialization.html?testfile=${testFile}&key=${BYPASS_WAF}#Bob`,
		);
		await this.connectBtn.waitForEnabled();
	}
	async init() {
		await browser.url("/e2e/alice.html");
		await browser.waitUntil(async () => {
			const title = await browser.getTitle();
			return title === "Alice";
		});
		await browser.newWindow("/e2e/bob.html");
		await browser.waitUntil(async () => {
			const title = await browser.getTitle();
			return title === "Bob";
		});
	}
}

export default new SerializationPage();



================================================
FILE: e2e/datachannel/serialization_binary.spec.ts
================================================
import P from "./serialization.page.js";
import { serializationTest } from "./serializationTest.js";
describe("DataChannel:Binary", () => {
	beforeAll(
		async () => {
			await P.init();
		},
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer numbers",
		serializationTest("./numbers", "binary"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer strings",
		serializationTest("./strings", "binary"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer long string",
		serializationTest("./long_string", "binary"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer objects",
		serializationTest("./objects", "binary"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer Blobs",
		serializationTest("./blobs", "binary"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer Files",
		serializationTest("./files", "binary"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer arrays",
		serializationTest("./arrays", "binary"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer Dates as strings",
		serializationTest("./dates_as_string", "binary"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer ArrayBuffers",
		serializationTest("./arraybuffers", "binary"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer TypedArrayView as ArrayBuffer",
		serializationTest("./TypedArrayView_as_ArrayBuffer", "binary"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer Uint8Arrays as ArrayBuffer",
		serializationTest("./Uint8Array_as_ArrayBuffer", "binary"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer Int32Arrays as ArrayBuffer",
		serializationTest("./Int32Array_as_ArrayBuffer", "binary"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
});



================================================
FILE: e2e/datachannel/serialization_json.spec.ts
================================================
import P from "./serialization.page.js";
import { serializationTest } from "./serializationTest.js";

describe("DataChannel:JSON", () => {
	beforeAll(
		async () => {
			await P.init();
		},
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer numbers",
		serializationTest("./numbers", "json"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer strings",
		serializationTest("./strings", "json"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	// it("should transfer long string", serializationTest("./long_string", "json"));
	it(
		"should transfer objects",
		serializationTest("./objects", "json"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer arrays (no chunks)",
		serializationTest("./arrays_unchunked", "json"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	it(
		"should transfer Dates as strings",
		serializationTest("./dates_as_json_string", "json"),
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
	// it("should transfer ArrayBuffers", serializationTest("./arraybuffers", "json"));
	// it("should transfer TypedArrayView", serializationTest("./typed_array_view", "json"));
	// it(
	// 	"should transfer Uint8Arrays",
	// 	serializationTest("./Uint8Array", "json"),
	// );
	// it(
	// 	"should transfer Int32Arrays",
	// 	serializationTest("./Int32Array", "json"),
	// );
});



================================================
FILE: e2e/datachannel/serialization_msgpack.spec.ts
================================================
import P from "./serialization.page.js";
import { serializationTest } from "./serializationTest.js";
import { browser } from "@wdio/globals";

describe("DataChannel:MsgPack", function () {
	beforeAll(async function () {
		await P.init();
	});
	beforeEach(async function () {
		if (
			// @ts-ignore
			browser.capabilities.browserName === "firefox" &&
			// @ts-ignore
			parseInt(browser.capabilities.browserVersion) < 102
		) {
			pending("Firefox 102+ required for Streams");
		}
	});
	it("should transfer numbers", serializationTest("./numbers", "MsgPack"));
	it("should transfer strings", serializationTest("./strings", "MsgPack"));
	it(
		"should transfer long string",
		serializationTest("./long_string", "MsgPack"),
	);
	it("should transfer objects", serializationTest("./objects", "MsgPack"));
	it("should transfer arrays", serializationTest("./arrays", "MsgPack"));
	it(
		"should transfer Dates as strings",
		serializationTest("./dates", "MsgPack"),
	);
	// it("should transfer ArrayBuffers", serializationTest("./arraybuffers", "MsgPack"));
	it(
		"should transfer TypedArrayView",
		serializationTest("./typed_array_view", "MsgPack"),
	);
	it(
		"should transfer Uint8Arrays",
		serializationTest("./Uint8Array", "MsgPack"),
	);
	it(
		"should transfer Int32Arrays as Uint8Arrays",
		serializationTest("./Int32Array_as_Uint8Array", "MsgPack"),
	);
});



================================================
FILE: e2e/datachannel/serializationTest.ts
================================================
import P from "./serialization.page.js";
import { browser, expect } from "@wdio/globals";

export const serializationTest =
	(testFile: string, serialization: string) => async () => {
		await P.open(testFile, serialization);
		await P.waitForMessage("Your Peer ID: ");
		const bobId = (await P.messages.getText()).split("Your Peer ID: ")[1];
		await browser.switchWindow("Alice");
		await P.waitForMessage("Your Peer ID: ");
		await P.receiverId.setValue(bobId);
		await P.connectBtn.click();
		await P.waitForMessage("Connected!");
		await P.sendBtn.click();
		await P.waitForMessage("Sent!");
		await browser.switchWindow("Bob");
		await P.waitForMessage("Closed!");
		await P.checkBtn.click();
		await P.waitForMessage("Checked!");

		await expect(await P.errorMessage.getText()).toBe("");
		await expect(await P.result.getText()).toBe("Success!");
	};



================================================
FILE: e2e/datachannel/strings.js
================================================
import { strings } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	expect(received).to.deep.equal(strings);
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	for (const string of strings) {
		dataConnection.send(string);
	}
};



================================================
FILE: e2e/datachannel/typed_array_view.js
================================================
import { typed_array_view } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	const received_typed_array_view = received[0];
	expect(received_typed_array_view).to.deep.equal(typed_array_view);
	for (const [i, v] of received_typed_array_view.entries()) {
		expect(v).to.deep.equal(typed_array_view[i]);
	}
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	dataConnection.send(typed_array_view);
};



================================================
FILE: e2e/datachannel/TypedArrayView_as_ArrayBuffer.js
================================================
import { typed_array_view } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	const received_typed_array_view = received[0];
	expect(received_typed_array_view).to.be.instanceOf(ArrayBuffer);
	expect(new Uint8Array(received_typed_array_view)).to.deep.equal(
		typed_array_view,
	);
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	dataConnection.send(typed_array_view);
};



================================================
FILE: e2e/datachannel/Uint8Array.js
================================================
import { uint8_arrays } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	for (const [i, typed_array] of uint8_arrays.entries()) {
		expect(received[i]).to.be.an.instanceof(Uint8Array);
		expect(received[i]).to.deep.equal(typed_array);
	}
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	for (const typed_array of uint8_arrays) {
		dataConnection.send(typed_array);
	}
};



================================================
FILE: e2e/datachannel/Uint8Array_as_ArrayBuffer.js
================================================
import { uint8_arrays } from "../data.js";
import { expect } from "https://esm.sh/v126/chai@4.3.7/X-dHMvZXhwZWN0/es2021/chai.bundle.mjs";

/** @param {unknown[]} received */
export const check = (received) => {
	for (const [i, typed_array] of uint8_arrays.entries()) {
		expect(received[i]).to.be.an.instanceof(ArrayBuffer);
		expect(new Uint8Array(received[i])).to.deep.equal(typed_array);
	}
};
/**
 * @param {import("../peerjs").DataConnection} dataConnection
 */
export const send = (dataConnection) => {
	for (const typed_array of uint8_arrays) {
		dataConnection.send(typed_array);
	}
};



================================================
FILE: e2e/mediachannel/close.html
================================================
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title></title>
		<link rel="stylesheet" href="../style.css" />
	</head>
	<body>
		<h1>MediaChannel</h1>
		<canvas id="sender-stream" width="200" height="100"></canvas>
		<video id="receiver-stream" autoplay></video>
		<script>
			const canvas = document.getElementById("sender-stream");
			const ctx = canvas.getContext("2d");

			// Set the canvas background color to white
			ctx.fillStyle = "white";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Draw the text "Alice" in black
			ctx.font = "30px sans-serif";
			ctx.fillStyle = "black";
			ctx.fillText(window.location.hash.substring(1), 50, 50);
		</script>
		<div id="inputs">
			<input type="text" id="receiver-id" placeholder="Receiver ID" />
			<button id="call-btn" disabled>Call</button>
			<button id="close-btn">Hang up</button>
		</div>
		<div id="messages"></div>
		<div id="result"></div>
		<div id="error-message"></div>
		<video></video>
		<script src="/dist/peerjs.js"></script>
		<script src="close.js" type="application/javascript"></script>
	</body>
</html>



================================================
FILE: e2e/mediachannel/close.js
================================================
/**
 * @type {typeof import("../..").Peer}
 */
const Peer = window.peerjs.Peer;

const params = new URLSearchParams(document.location.search);

document.getElementsByTagName("title")[0].innerText =
	window.location.hash.substring(1);

const callBtn = document.getElementById("call-btn");
console.log(callBtn);
const receiverIdInput = document.getElementById("receiver-id");
const closeBtn = document.getElementById("close-btn");
const messages = document.getElementById("messages");
const errorMessage = document.getElementById("error-message");

const stream = window["sender-stream"].captureStream(30);
const peer = new Peer({ debug: 3, key: params.get("key") });
/**
 * @type {import("peerjs").MediaConnection}
 */
let mediaConnection;
peer
	.once("open", (id) => {
		messages.textContent = `Your Peer ID: ${id}`;
	})
	.once("error", (error) => {
		errorMessage.textContent = JSON.stringify(error);
	})
	.once("call", (call) => {
		mediaConnection = call;
		mediaConnection
			.once("stream", function (stream) {
				const video = document.getElementById("receiver-stream");
				video.srcObject = stream;
				video.play();
			})
			.once("close", () => {
				messages.textContent = "Closed!";
			})
			.once("willCloseOnRemote", () => {
				messages.textContent = "Connected!";
			});
		call.answer(stream);
	});

callBtn.addEventListener("click", async () => {
	console.log("calling");

	/** @type {string} */
	const receiverId = receiverIdInput.value;
	if (receiverId) {
		mediaConnection = peer.call(receiverId, stream);
		mediaConnection
			.once("stream", (stream) => {
				const video = document.getElementById("receiver-stream");
				video.srcObject = stream;
				video.play();
				messages.innerText = "Connected!";
			})
			.once("close", () => {
				messages.textContent = "Closed!";
			});
	}
});

closeBtn.addEventListener("click", () => {
	mediaConnection.close();
});

callBtn.disabled = false;



================================================
FILE: e2e/mediachannel/close.page.ts
================================================
import { browser, $ } from "@wdio/globals";

const { BYPASS_WAF } = process.env;

class SerializationPage {
	get receiverId() {
		return $("input[id='receiver-id']");
	}
	get callBtn() {
		return $("button[id='call-btn']");
	}

	get messages() {
		return $("div[id='messages']");
	}

	get closeBtn() {
		return $("button[id='close-btn']");
	}

	get errorMessage() {
		return $("div[id='error-message']");
	}

	get result() {
		return $("div[id='result']");
	}

	waitForMessage(right: string) {
		return browser.waitUntil(
			async () => {
				const messages = await this.messages.getText();
				return messages.startsWith(right);
			},
			{ timeoutMsg: `Expected message to start with ${right}`, timeout: 10000 },
		);
	}

	async open() {
		await browser.switchWindow("Alice");
		await browser.url(`/e2e/mediachannel/close.html?key=${BYPASS_WAF}#Alice`);
		await this.callBtn.waitForEnabled();

		await browser.switchWindow("Bob");
		await browser.url(`/e2e/mediachannel/close.html?key=${BYPASS_WAF}#Bob`);
		await this.callBtn.waitForEnabled();
	}
	async init() {
		await browser.url("/e2e/alice.html");
		await browser.waitUntil(async () => {
			const title = await browser.getTitle();
			return title === "Alice";
		});
		await browser.pause(1000);
		await browser.newWindow("/e2e/bob.html");
		await browser.waitUntil(async () => {
			const title = await browser.getTitle();
			return title === "Bob";
		});
		await browser.pause(1000);
	}
}

export default new SerializationPage();



================================================
FILE: e2e/mediachannel/close.spec.ts
================================================
import P from "./close.page.js";
import { browser } from "@wdio/globals";

describe("MediaStream", () => {
	beforeAll(
		async () => {
			await P.init();
		},
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		1,
	);
	it(
		"should close the remote stream",
		async () => {
			await P.open();
			await P.waitForMessage("Your Peer ID: ");
			const bobId = (await P.messages.getText()).split("Your Peer ID: ")[1];
			await browser.switchWindow("Alice");
			await P.waitForMessage("Your Peer ID: ");
			await P.receiverId.setValue(bobId);
			await P.callBtn.click();
			await P.waitForMessage("Connected!");
			await browser.switchWindow("Bob");
			await P.waitForMessage("Connected!");
			await P.closeBtn.click();
			await P.waitForMessage("Closed!");
			await browser.switchWindow("Alice");
			await P.waitForMessage("Closed!");
		},
		jasmine.DEFAULT_TIMEOUT_INTERVAL,
		2,
	);
});



================================================
FILE: e2e/peer/disconnected.html
================================================
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title></title>
		<link rel="stylesheet" href="../style.css" />
	</head>
	<body>
		<h1>ID-TAKEN</h1>
		<div id="messages"></div>
		<div id="error-message"></div>
		<script src="/dist/peerjs.js"></script>
		<script type="application/javascript">
			/**
			 * @type {typeof import("../..").Peer}
			 */
			const Peer = window.peerjs.Peer;

			const params = new URLSearchParams(document.location.search);

			const messages = document.getElementById("messages");

			const peer = new Peer({ key: params.get("key") });
			peer
				.once(
					"error",
					(error) => void (messages.textContent = JSON.stringify(error)),
				)
				.once("open", (id) => {
					peer.disconnect();
					peer.connect("otherid");
				});
		</script>
	</body>
</html>



================================================
FILE: e2e/peer/id-taken.html
================================================
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title></title>
		<link rel="stylesheet" href="../style.css" />
	</head>
	<body>
		<h1>ID-TAKEN</h1>
		<div id="messages"></div>
		<div id="error-message"></div>
		<script src="/dist/peerjs.js"></script>
		<script type="application/javascript">
			/**
			 * @type {typeof import("../..").Peer}
			 */
			const Peer = window.peerjs.Peer;

			const params = new URLSearchParams(document.location.search);

			const messages = document.getElementById("messages");
			const errorMessage = document.getElementById("error-message");

			// Peer A should be created without an error
			const peerA = new Peer({ key: params.get("key") })
				.once(
					"error",
					(err) => (errorMessage.textContent += JSON.stringify(err)),
				)
				.once("open", (id) => {
					// Create 10 new `Peer`s that will try to steel A's id
					let peers_try_to_take = Array.from(
						{ length: 10 },
						(_, i) =>
							new Promise((resolve, reject) =>
								new Peer(id, { key: params.get("BYPASS_WAF") })
									.once("open", () =>
										reject(`Peer ${i} failed! Connection got established.`),
									)
									.once("error", (error) => {
										if (error.type === "unavailable-id") {
											resolve(`ID already taken. (${i})`);
										} else {
											reject(error);
										}
									}),
							),
					);
					Promise.all(peers_try_to_take)
						.then(() => (messages.textContent = "No ID takeover"))
						.catch(
							(error) => (errorMessage.textContent += JSON.stringify(error)),
						);
				});
		</script>
	</body>
</html>



================================================
FILE: e2e/peer/peer.page.ts
================================================
import { browser, $ } from "@wdio/globals";

const { BYPASS_WAF } = process.env;

class PeerPage {
	get messages() {
		return $("div[id='messages']");
	}

	get errorMessage() {
		return $("div[id='error-message']");
	}

	waitForMessage(right: string) {
		return browser.waitUntil(
			async () => {
				const messages = await this.messages.getText();
				return messages.startsWith(right);
			},
			{ timeoutMsg: `Expected message to start with ${right}`, timeout: 10000 },
		);
	}

	async open(test: string) {
		await browser.url(`/e2e/peer/${test}.html?key=${BYPASS_WAF}`);
	}
}

export default new PeerPage();



================================================
FILE: e2e/peer/peer.spec.ts
================================================
import P from "./peer.page.js";
import { browser, expect } from "@wdio/globals";

describe("Peer", () => {
	it("should emit an error, when the ID is already taken", async () => {
		await P.open("id-taken");
		await P.waitForMessage("No ID takeover");
		expect(await P.errorMessage.getText()).toBe("");
	});
	it("should emit an error, when the server is unavailable", async () => {
		await P.open("server-unavailable");
		await P.waitForMessage('{"type":"server-error"}');
		expect(await P.errorMessage.getText()).toBe("");
	});
	it("should emit an error, when it got disconnected from the server", async () => {
		await P.open("disconnected");
		await P.waitForMessage('{"type":"disconnected"}');
		expect(await P.errorMessage.getText()).toBe("");
	});
});



================================================
FILE: e2e/peer/server-unavailable.html
================================================
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title></title>
		<link rel="stylesheet" href="../style.css" />
	</head>
	<body>
		<h1>ID-TAKEN</h1>
		<div id="messages"></div>
		<div id="error-message"></div>
		<script src="/dist/peerjs.js"></script>
		<script type="application/javascript">
			/**
			 * @type {typeof import("../..").Peer}
			 */
			const Peer = window.peerjs.Peer;

			const messages = document.getElementById("messages");
			const errorMessage = document.getElementById("error-message");

			new Peer({
				host: "thisserverwillneverexist.example.com",
			}).once(
				"error",
				(error) => void (messages.textContent = JSON.stringify(error)),
			);
		</script>
	</body>
</html>



================================================
FILE: lib/api.ts
================================================
import { util } from "./util";
import logger from "./logger";
import type { PeerJSOption } from "./optionInterfaces";
import { version } from "./version";

export class API {
	constructor(private readonly _options: PeerJSOption) {}

	private _buildRequest(method: string): Promise<Response> {
		const protocol = this._options.secure ? "https" : "http";
		const { host, port, path, key } = this._options;
		const url = new URL(`${protocol}://${host}:${port}${path}${key}/${method}`);
		// TODO: Why timestamp, why random?
		url.searchParams.set("ts", `${Date.now()}${Math.random()}`);
		url.searchParams.set("version", version);
		return fetch(url.href, {
			referrerPolicy: this._options.referrerPolicy,
		});
	}

	/** Get a unique ID from the server via XHR and initialize with it. */
	async retrieveId(): Promise<string> {
		try {
			const response = await this._buildRequest("id");

			if (response.status !== 200) {
				throw new Error(`Error. Status:${response.status}`);
			}

			return response.text();
		} catch (error) {
			logger.error("Error retrieving ID", error);

			let pathError = "";

			if (
				this._options.path === "/" &&
				this._options.host !== util.CLOUD_HOST
			) {
				pathError =
					" If you passed in a `path` to your self-hosted PeerServer, " +
					"you'll also need to pass in that same path when creating a new " +
					"Peer.";
			}

			throw new Error("Could not get an ID from the server." + pathError);
		}
	}

	/** @deprecated */
	async listAllPeers(): Promise<any[]> {
		try {
			const response = await this._buildRequest("peers");

			if (response.status !== 200) {
				if (response.status === 401) {
					let helpfulError = "";

					if (this._options.host === util.CLOUD_HOST) {
						helpfulError =
							"It looks like you're using the cloud server. You can email " +
							"team@peerjs.com to enable peer listing for your API key.";
					} else {
						helpfulError =
							"You need to enable `allow_discovery` on your self-hosted " +
							"PeerServer to use this feature.";
					}

					throw new Error(
						"It doesn't look like you have permission to list peers IDs. " +
							helpfulError,
					);
				}

				throw new Error(`Error. Status:${response.status}`);
			}

			return response.json();
		} catch (error) {
			logger.error("Error retrieving list peers", error);

			throw new Error("Could not get list peers from the server." + error);
		}
	}
}



================================================
FILE: lib/baseconnection.ts
================================================
import type { Peer } from "./peer";
import type { ServerMessage } from "./servermessage";
import type { ConnectionType } from "./enums";
import { BaseConnectionErrorType } from "./enums";
import {
	EventEmitterWithError,
	type EventsWithError,
	PeerError,
} from "./peerError";
import type { ValidEventTypes } from "eventemitter3";

export interface BaseConnectionEvents<
	ErrorType extends string = BaseConnectionErrorType,
> extends EventsWithError<ErrorType> {
	/**
	 * Emitted when either you or the remote peer closes the connection.
	 *
	 * ```ts
	 * connection.on('close', () => { ... });
	 * ```
	 */
	close: () => void;
	/**
	 * ```ts
	 * connection.on('error', (error) => { ... });
	 * ```
	 */
	error: (error: PeerError<`${ErrorType}`>) => void;
	iceStateChanged: (state: RTCIceConnectionState) => void;
}

export abstract class BaseConnection<
	SubClassEvents extends ValidEventTypes,
	ErrorType extends string = never,
> extends EventEmitterWithError<
	ErrorType | BaseConnectionErrorType,
	SubClassEvents & BaseConnectionEvents<BaseConnectionErrorType | ErrorType>
> {
	protected _open = false;

	/**
	 * Any type of metadata associated with the connection,
	 * passed in by whoever initiated the connection.
	 */
	readonly metadata: any;
	connectionId: string;

	peerConnection: RTCPeerConnection;
	dataChannel: RTCDataChannel;

	abstract get type(): ConnectionType;

	/**
	 * The optional label passed in or assigned by PeerJS when the connection was initiated.
	 */
	label: string;

	/**
	 * Whether the media connection is active (e.g. your call has been answered).
	 * You can check this if you want to set a maximum wait time for a one-sided call.
	 */
	get open() {
		return this._open;
	}

	protected constructor(
		/**
		 * The ID of the peer on the other end of this connection.
		 */
		readonly peer: string,
		public provider: Peer,
		readonly options: any,
	) {
		super();

		this.metadata = options.metadata;
	}

	abstract close(): void;

	/**
	 * @internal
	 */
	abstract handleMessage(message: ServerMessage): void;

	/**
	 * Called by the Negotiator when the DataChannel is ready.
	 * @internal
	 * */
	abstract _initializeDataChannel(dc: RTCDataChannel): void;
}



================================================
FILE: lib/encodingQueue.ts
================================================
import { EventEmitter } from "eventemitter3";
import logger from "./logger";

export class EncodingQueue extends EventEmitter {
	readonly fileReader: FileReader = new FileReader();

	private _queue: Blob[] = [];
	private _processing: boolean = false;

	constructor() {
		super();

		this.fileReader.onload = (evt) => {
			this._processing = false;

			if (evt.target) {
				this.emit("done", evt.target.result as ArrayBuffer);
			}

			this.doNextTask();
		};

		this.fileReader.onerror = (evt) => {
			logger.error(`EncodingQueue error:`, evt);
			this._processing = false;
			this.destroy();
			this.emit("error", evt);
		};
	}

	get queue(): Blob[] {
		return this._queue;
	}

	get size(): number {
		return this.queue.length;
	}

	get processing(): boolean {
		return this._processing;
	}

	enque(blob: Blob): void {
		this.queue.push(blob);

		if (this.processing) return;

		this.doNextTask();
	}

	destroy(): void {
		this.fileReader.abort();
		this._queue = [];
	}

	private doNextTask(): void {
		if (this.size === 0) return;
		if (this.processing) return;

		this._processing = true;

		this.fileReader.readAsArrayBuffer(this.queue.shift());
	}
}



================================================
FILE: lib/enums.ts
================================================
export enum ConnectionType {
	Data = "data",
	Media = "media",
}

export enum PeerErrorType {
	/**
	 * The client's browser does not support some or all WebRTC features that you are trying to use.
	 */
	BrowserIncompatible = "browser-incompatible",
	/**
	 * You've already disconnected this peer from the server and can no longer make any new connections on it.
	 */
	Disconnected = "disconnected",
	/**
	 * The ID passed into the Peer constructor contains illegal characters.
	 */
	InvalidID = "invalid-id",
	/**
	 * The API key passed into the Peer constructor contains illegal characters or is not in the system (cloud server only).
	 */
	InvalidKey = "invalid-key",
	/**
	 * Lost or cannot establish a connection to the signalling server.
	 */
	Network = "network",
	/**
	 * The peer you're trying to connect to does not exist.
	 */
	PeerUnavailable = "peer-unavailable",
	/**
	 * PeerJS is being used securely, but the cloud server does not support SSL. Use a custom PeerServer.
	 */
	SslUnavailable = "ssl-unavailable",
	/**
	 * Unable to reach the server.
	 */
	ServerError = "server-error",
	/**
	 * An error from the underlying socket.
	 */
	SocketError = "socket-error",
	/**
	 * The underlying socket closed unexpectedly.
	 */
	SocketClosed = "socket-closed",
	/**
	 * The ID passed into the Peer constructor is already taken.
	 *
	 * :::caution
	 * This error is not fatal if your peer has open peer-to-peer connections.
	 * This can happen if you attempt to {@apilink Peer.reconnect} a peer that has been disconnected from the server,
	 * but its old ID has now been taken.
	 * :::
	 */
	UnavailableID = "unavailable-id",
	/**
	 * Native WebRTC errors.
	 */
	WebRTC = "webrtc",
}

export enum BaseConnectionErrorType {
	NegotiationFailed = "negotiation-failed",
	ConnectionClosed = "connection-closed",
}

export enum DataConnectionErrorType {
	NotOpenYet = "not-open-yet",
	MessageToBig = "message-too-big",
}

export enum SerializationType {
	Binary = "binary",
	BinaryUTF8 = "binary-utf8",
	JSON = "json",
	None = "raw",
}

export enum SocketEventType {
	Message = "message",
	Disconnected = "disconnected",
	Error = "error",
	Close = "close",
}

export enum ServerMessageType {
	Heartbeat = "HEARTBEAT",
	Candidate = "CANDIDATE",
	Offer = "OFFER",
	Answer = "ANSWER",
	Open = "OPEN", // The connection to the server is open.
	Error = "ERROR", // Server error.
	IdTaken = "ID-TAKEN", // The selected ID is taken.
	InvalidKey = "INVALID-KEY", // The given API key cannot be found.
	Leave = "LEAVE", // Another peer has closed its connection to this peer.
	Expire = "EXPIRE", // The offer sent to a peer has expired without response.
}



================================================
FILE: lib/exports.ts
================================================
export { util, type Util } from "./util";
import { Peer } from "./peer";
import { MsgPackPeer } from "./msgPackPeer";

export type { PeerEvents, PeerOptions } from "./peer";

export type {
	PeerJSOption,
	PeerConnectOption,
	AnswerOption,
	CallOption,
} from "./optionInterfaces";
export type { UtilSupportsObj } from "./util";
export type { DataConnection } from "./dataconnection/DataConnection";
export type { MediaConnection } from "./mediaconnection";
export type { LogLevel } from "./logger";
export * from "./enums";

export { BufferedConnection } from "./dataconnection/BufferedConnection/BufferedConnection";
export { StreamConnection } from "./dataconnection/StreamConnection/StreamConnection";
export { MsgPack } from "./dataconnection/StreamConnection/MsgPack";
export type { SerializerMapping } from "./peer";

export { Peer, MsgPackPeer };

export { PeerError } from "./peerError";
export default Peer;



================================================
FILE: lib/global.ts
================================================
import { util } from "./util";
import { Peer } from "./peer";

(<any>window).peerjs = {
	Peer,
	util,
};
/** @deprecated Should use peerjs namespace */
(<any>window).Peer = Peer;



================================================
FILE: lib/logger.ts
================================================
const LOG_PREFIX = "PeerJS: ";

/*
Prints log messages depending on the debug level passed in. Defaults to 0.
0  Prints no logs.
1  Prints only errors.
2  Prints errors and warnings.
3  Prints all logs.
*/
export enum LogLevel {
	/**
	 * Prints no logs.
	 */
	Disabled,
	/**
	 * Prints only errors.
	 */
	Errors,
	/**
	 * Prints errors and warnings.
	 */
	Warnings,
	/**
	 * Prints all logs.
	 */
	All,
}

class Logger {
	private _logLevel = LogLevel.Disabled;

	get logLevel(): LogLevel {
		return this._logLevel;
	}

	set logLevel(logLevel: LogLevel) {
		this._logLevel = logLevel;
	}

	log(...args: any[]) {
		if (this._logLevel >= LogLevel.All) {
			this._print(LogLevel.All, ...args);
		}
	}

	warn(...args: any[]) {
		if (this._logLevel >= LogLevel.Warnings) {
			this._print(LogLevel.Warnings, ...args);
		}
	}

	error(...args: any[]) {
		if (this._logLevel >= LogLevel.Errors) {
			this._print(LogLevel.Errors, ...args);
		}
	}

	setLogFunction(fn: (logLevel: LogLevel, ..._: any[]) => void): void {
		this._print = fn;
	}

	private _print(logLevel: LogLevel, ...rest: any[]): void {
		const copy = [LOG_PREFIX, ...rest];

		for (const i in copy) {
			if (copy[i] instanceof Error) {
				copy[i] = "(" + copy[i].name + ") " + copy[i].message;
			}
		}

		if (logLevel >= LogLevel.All) {
			console.log(...copy);
		} else if (logLevel >= LogLevel.Warnings) {
			console.warn("WARNING", ...copy);
		} else if (logLevel >= LogLevel.Errors) {
			console.error("ERROR", ...copy);
		}
	}
}

export default new Logger();



================================================
FILE: lib/mediaconnection.ts
================================================
import { util } from "./util";
import logger from "./logger";
import { Negotiator } from "./negotiator";
import { ConnectionType, ServerMessageType } from "./enums";
import type { Peer } from "./peer";
import { BaseConnection, type BaseConnectionEvents } from "./baseconnection";
import type { ServerMessage } from "./servermessage";
import type { AnswerOption } from "./optionInterfaces";

export interface MediaConnectionEvents extends BaseConnectionEvents<never> {
	/**
	 * Emitted when a connection to the PeerServer is established.
	 *
	 * ```ts
	 * mediaConnection.on('stream', (stream) => { ... });
	 * ```
	 */
	stream: (stream: MediaStream) => void;
	/**
	 * Emitted when the auxiliary data channel is established.
	 * After this event, hanging up will close the connection cleanly on the remote peer.
	 * @beta
	 */
	willCloseOnRemote: () => void;
}

/**
 * Wraps WebRTC's media streams.
 * To get one, use {@apilink Peer.call} or listen for the {@apilink PeerEvents | `call`} event.
 */
export class MediaConnection extends BaseConnection<MediaConnectionEvents> {
	private static readonly ID_PREFIX = "mc_";
	readonly label: string;

	private _negotiator: Negotiator<MediaConnectionEvents, this>;
	private _localStream: MediaStream;
	private _remoteStream: MediaStream;

	/**
	 * For media connections, this is always 'media'.
	 */
	get type() {
		return ConnectionType.Media;
	}

	get localStream(): MediaStream {
		return this._localStream;
	}

	get remoteStream(): MediaStream {
		return this._remoteStream;
	}

	constructor(peerId: string, provider: Peer, options: any) {
		super(peerId, provider, options);

		this._localStream = this.options._stream;
		this.connectionId =
			this.options.connectionId ||
			MediaConnection.ID_PREFIX + util.randomToken();

		this._negotiator = new Negotiator(this);

		if (this._localStream) {
			this._negotiator.startConnection({
				_stream: this._localStream,
				originator: true,
			});
		}
	}

	/** Called by the Negotiator when the DataChannel is ready. */
	override _initializeDataChannel(dc: RTCDataChannel): void {
		this.dataChannel = dc;

		this.dataChannel.onopen = () => {
			logger.log(`DC#${this.connectionId} dc connection success`);
			this.emit("willCloseOnRemote");
		};

		this.dataChannel.onclose = () => {
			logger.log(`DC#${this.connectionId} dc closed for:`, this.peer);
			this.close();
		};
	}
	addStream(remoteStream) {
		logger.log("Receiving stream", remoteStream);

		this._remoteStream = remoteStream;
		super.emit("stream", remoteStream); // Should we call this `open`?
	}

	/**
	 * @internal
	 */
	handleMessage(message: ServerMessage): void {
		const type = message.type;
		const payload = message.payload;

		switch (message.type) {
			case ServerMessageType.Answer:
				// Forward to negotiator
				void this._negotiator.handleSDP(type, payload.sdp);
				this._open = true;
				break;
			case ServerMessageType.Candidate:
				void this._negotiator.handleCandidate(payload.candidate);
				break;
			default:
				logger.warn(`Unrecognized message type:${type} from peer:${this.peer}`);
				break;
		}
	}

	/**
     * When receiving a {@apilink PeerEvents | `call`} event on a peer, you can call
     * `answer` on the media connection provided by the callback to accept the call
     * and optionally send your own media stream.

     *
     * @param stream A WebRTC media stream.
     * @param options
     * @returns
     */
	answer(stream?: MediaStream, options: AnswerOption = {}): void {
		if (this._localStream) {
			logger.warn(
				"Local stream already exists on this MediaConnection. Are you answering a call twice?",
			);
			return;
		}

		this._localStream = stream;

		if (options && options.sdpTransform) {
			this.options.sdpTransform = options.sdpTransform;
		}

		this._negotiator.startConnection({
			...this.options._payload,
			_stream: stream,
		});
		// Retrieve lost messages stored because PeerConnection not set up.
		const messages = this.provider._getMessages(this.connectionId);

		for (const message of messages) {
			this.handleMessage(message);
		}

		this._open = true;
	}

	/**
	 * Exposed functionality for users.
	 */

	/**
	 * Closes the media connection.
	 */
	close(): void {
		if (this._negotiator) {
			this._negotiator.cleanup();
			this._negotiator = null;
		}

		this._localStream = null;
		this._remoteStream = null;

		if (this.provider) {
			this.provider._removeConnection(this);

			this.provider = null;
		}

		if (this.options && this.options._stream) {
			this.options._stream = null;
		}

		if (!this.open) {
			return;
		}

		this._open = false;

		super.emit("close");
	}
}



================================================
FILE: lib/msgPackPeer.ts
================================================
import { Peer, type SerializerMapping } from "./peer";
import { MsgPack } from "./exports";

/**
 * @experimental
 */
export class MsgPackPeer extends Peer {
	override _serializers: SerializerMapping = {
		MsgPack,
		default: MsgPack,
	};
}



================================================
FILE: lib/negotiator.ts
================================================
import logger from "./logger";
import type { MediaConnection } from "./mediaconnection";
import type { DataConnection } from "./dataconnection/DataConnection";
import {
	BaseConnectionErrorType,
	ConnectionType,
	PeerErrorType,
	ServerMessageType,
} from "./enums";
import type { BaseConnection, BaseConnectionEvents } from "./baseconnection";
import type { ValidEventTypes } from "eventemitter3";

/**
 * Manages all negotiations between Peers.
 */
export class Negotiator<
	Events extends ValidEventTypes,
	ConnectionType extends BaseConnection<Events | BaseConnectionEvents>,
> {
	constructor(readonly connection: ConnectionType) {}

	/** Returns a PeerConnection object set up correctly (for data, media). */
	startConnection(options: any) {
		const peerConnection = this._startPeerConnection();

		// Set the connection's PC.
		this.connection.peerConnection = peerConnection;

		if (this.connection.type === ConnectionType.Media && options._stream) {
			this._addTracksToConnection(options._stream, peerConnection);
		}

		// What do we need to do now?
		if (options.originator) {
			const dataConnection = this.connection;

			const config: RTCDataChannelInit = { ordered: !!options.reliable };

			const dataChannel = peerConnection.createDataChannel(
				dataConnection.label,
				config,
			);
			dataConnection._initializeDataChannel(dataChannel);

			void this._makeOffer();
		} else {
			void this.handleSDP("OFFER", options.sdp);
		}
	}

	/** Start a PC. */
	private _startPeerConnection(): RTCPeerConnection {
		logger.log("Creating RTCPeerConnection.");

		const peerConnection = new RTCPeerConnection(
			this.connection.provider.options.config,
		);

		this._setupListeners(peerConnection);

		return peerConnection;
	}

	/** Set up various WebRTC listeners. */
	private _setupListeners(peerConnection: RTCPeerConnection) {
		const peerId = this.connection.peer;
		const connectionId = this.connection.connectionId;
		const connectionType = this.connection.type;
		const provider = this.connection.provider;

		// ICE CANDIDATES.
		logger.log("Listening for ICE candidates.");

		peerConnection.onicecandidate = (evt) => {
			if (!evt.candidate || !evt.candidate.candidate) return;

			logger.log(`Received ICE candidates for ${peerId}:`, evt.candidate);

			provider.socket.send({
				type: ServerMessageType.Candidate,
				payload: {
					candidate: evt.candidate,
					type: connectionType,
					connectionId: connectionId,
				},
				dst: peerId,
			});
		};

		peerConnection.oniceconnectionstatechange = () => {
			switch (peerConnection.iceConnectionState) {
				case "failed":
					logger.log(
						"iceConnectionState is failed, closing connections to " + peerId,
					);
					this.connection.emitError(
						BaseConnectionErrorType.NegotiationFailed,
						"Negotiation of connection to " + peerId + " failed.",
					);
					this.connection.close();
					break;
				case "closed":
					logger.log(
						"iceConnectionState is closed, closing connections to " + peerId,
					);
					this.connection.emitError(
						BaseConnectionErrorType.ConnectionClosed,
						"Connection to " + peerId + " closed.",
					);
					this.connection.close();
					break;
				case "disconnected":
					logger.log(
						"iceConnectionState changed to disconnected on the connection with " +
							peerId,
					);
					break;
				case "completed":
					peerConnection.onicecandidate = () => {};
					break;
			}

			this.connection.emit(
				"iceStateChanged",
				peerConnection.iceConnectionState,
			);
		};

		// DATACONNECTION.
		logger.log("Listening for data channel");
		// Fired between offer and answer, so options should already be saved
		// in the options hash.
		peerConnection.ondatachannel = (evt) => {
			logger.log("Received data channel");

			const dataChannel = evt.channel;
			const connection = <DataConnection>(
				provider.getConnection(peerId, connectionId)
			);

			connection._initializeDataChannel(dataChannel);
		};

		// MEDIACONNECTION.
		logger.log("Listening for remote stream");

		peerConnection.ontrack = (evt) => {
			logger.log("Received remote stream");

			const stream = evt.streams[0];
			const connection = provider.getConnection(peerId, connectionId);

			if (connection.type === ConnectionType.Media) {
				const mediaConnection = <MediaConnection>connection;

				this._addStreamToMediaConnection(stream, mediaConnection);
			}
		};
	}

	cleanup(): void {
		logger.log("Cleaning up PeerConnection to " + this.connection.peer);

		const peerConnection = this.connection.peerConnection;

		if (!peerConnection) {
			return;
		}

		this.connection.peerConnection = null;

		//unsubscribe from all PeerConnection's events
		peerConnection.onicecandidate =
			peerConnection.oniceconnectionstatechange =
			peerConnection.ondatachannel =
			peerConnection.ontrack =
				() => {};

		const peerConnectionNotClosed = peerConnection.signalingState !== "closed";
		let dataChannelNotClosed = false;

		const dataChannel = this.connection.dataChannel;

		if (dataChannel) {
			dataChannelNotClosed =
				!!dataChannel.readyState && dataChannel.readyState !== "closed";
		}

		if (peerConnectionNotClosed || dataChannelNotClosed) {
			peerConnection.close();
		}
	}

	private async _makeOffer(): Promise<void> {
		const peerConnection = this.connection.peerConnection;
		const provider = this.connection.provider;

		try {
			const offer = await peerConnection.createOffer(
				this.connection.options.constraints,
			);

			logger.log("Created offer.");

			if (
				this.connection.options.sdpTransform &&
				typeof this.connection.options.sdpTransform === "function"
			) {
				offer.sdp =
					this.connection.options.sdpTransform(offer.sdp) || offer.sdp;
			}

			try {
				await peerConnection.setLocalDescription(offer);

				logger.log(
					"Set localDescription:",
					offer,
					`for:${this.connection.peer}`,
				);

				let payload: any = {
					sdp: offer,
					type: this.connection.type,
					connectionId: this.connection.connectionId,
					metadata: this.connection.metadata,
				};

				if (this.connection.type === ConnectionType.Data) {
					const dataConnection = <DataConnection>(<unknown>this.connection);

					payload = {
						...payload,
						label: dataConnection.label,
						reliable: dataConnection.reliable,
						serialization: dataConnection.serialization,
					};
				}

				provider.socket.send({
					type: ServerMessageType.Offer,
					payload,
					dst: this.connection.peer,
				});
			} catch (err) {
				// TODO: investigate why _makeOffer is being called from the answer
				if (
					err !=
					"OperationError: Failed to set local offer sdp: Called in wrong state: kHaveRemoteOffer"
				) {
					provider.emitError(PeerErrorType.WebRTC, err);
					logger.log("Failed to setLocalDescription, ", err);
				}
			}
		} catch (err_1) {
			provider.emitError(PeerErrorType.WebRTC, err_1);
			logger.log("Failed to createOffer, ", err_1);
		}
	}

	private async _makeAnswer(): Promise<void> {
		const peerConnection = this.connection.peerConnection;
		const provider = this.connection.provider;

		try {
			const answer = await peerConnection.createAnswer();
			logger.log("Created answer.");

			if (
				this.connection.options.sdpTransform &&
				typeof this.connection.options.sdpTransform === "function"
			) {
				answer.sdp =
					this.connection.options.sdpTransform(answer.sdp) || answer.sdp;
			}

			try {
				await peerConnection.setLocalDescription(answer);

				logger.log(
					`Set localDescription:`,
					answer,
					`for:${this.connection.peer}`,
				);

				provider.socket.send({
					type: ServerMessageType.Answer,
					payload: {
						sdp: answer,
						type: this.connection.type,
						connectionId: this.connection.connectionId,
					},
					dst: this.connection.peer,
				});
			} catch (err) {
				provider.emitError(PeerErrorType.WebRTC, err);
				logger.log("Failed to setLocalDescription, ", err);
			}
		} catch (err_1) {
			provider.emitError(PeerErrorType.WebRTC, err_1);
			logger.log("Failed to create answer, ", err_1);
		}
	}

	/** Handle an SDP. */
	async handleSDP(type: string, sdp: any): Promise<void> {
		sdp = new RTCSessionDescription(sdp);
		const peerConnection = this.connection.peerConnection;
		const provider = this.connection.provider;

		logger.log("Setting remote description", sdp);

		const self = this;

		try {
			await peerConnection.setRemoteDescription(sdp);
			logger.log(`Set remoteDescription:${type} for:${this.connection.peer}`);
			if (type === "OFFER") {
				await self._makeAnswer();
			}
		} catch (err) {
			provider.emitError(PeerErrorType.WebRTC, err);
			logger.log("Failed to setRemoteDescription, ", err);
		}
	}

	/** Handle a candidate. */
	async handleCandidate(ice: RTCIceCandidate) {
		logger.log(`handleCandidate:`, ice);

		try {
			await this.connection.peerConnection.addIceCandidate(ice);
			logger.log(`Added ICE candidate for:${this.connection.peer}`);
		} catch (err) {
			this.connection.provider.emitError(PeerErrorType.WebRTC, err);
			logger.log("Failed to handleCandidate, ", err);
		}
	}

	private _addTracksToConnection(
		stream: MediaStream,
		peerConnection: RTCPeerConnection,
	): void {
		logger.log(`add tracks from stream ${stream.id} to peer connection`);

		if (!peerConnection.addTrack) {
			return logger.error(
				`Your browser does't support RTCPeerConnection#addTrack. Ignored.`,
			);
		}

		stream.getTracks().forEach((track) => {
			peerConnection.addTrack(track, stream);
		});
	}

	private _addStreamToMediaConnection(
		stream: MediaStream,
		mediaConnection: MediaConnection,
	): void {
		logger.log(
			`add stream ${stream.id} to media connection ${mediaConnection.connectionId}`,
		);

		mediaConnection.addStream(stream);
	}
}



================================================
FILE: lib/optionInterfaces.ts
================================================
export interface AnswerOption {
	/**
	 * Function which runs before create answer to modify sdp answer message.
	 */
	sdpTransform?: Function;
}

export interface PeerJSOption {
	key?: string;
	host?: string;
	port?: number;
	path?: string;
	secure?: boolean;
	token?: string;
	config?: RTCConfiguration;
	debug?: number;
	referrerPolicy?: ReferrerPolicy;
}

export interface PeerConnectOption {
	/**
	 * A unique label by which you want to identify this data connection.
	 * If left unspecified, a label will be generated at random.
	 *
	 * Can be accessed with {@apilink DataConnection.label}
	 */
	label?: string;
	/**
	 * Metadata associated with the connection, passed in by whoever initiated the connection.
	 *
	 * Can be accessed with {@apilink DataConnection.metadata}.
	 * Can be any serializable type.
	 */
	metadata?: any;
	serialization?: string;
	reliable?: boolean;
}

export interface CallOption {
	/**
	 * Metadata associated with the connection, passed in by whoever initiated the connection.
	 *
	 * Can be accessed with {@apilink MediaConnection.metadata}.
	 * Can be any serializable type.
	 */
	metadata?: any;
	/**
	 * Function which runs before create offer to modify sdp offer message.
	 */
	sdpTransform?: Function;
}



================================================
FILE: lib/peer.ts
================================================
import { util } from "./util";
import logger, { LogLevel } from "./logger";
import { Socket } from "./socket";
import { MediaConnection } from "./mediaconnection";
import type { DataConnection } from "./dataconnection/DataConnection";
import {
	ConnectionType,
	PeerErrorType,
	ServerMessageType,
	SocketEventType,
} from "./enums";
import type { ServerMessage } from "./servermessage";
import { API } from "./api";
import type {
	CallOption,
	PeerConnectOption,
	PeerJSOption,
} from "./optionInterfaces";
import { BinaryPack } from "./dataconnection/BufferedConnection/BinaryPack";
import { Raw } from "./dataconnection/BufferedConnection/Raw";
import { Json } from "./dataconnection/BufferedConnection/Json";

import { EventEmitterWithError, PeerError } from "./peerError";

class PeerOptions implements PeerJSOption {
	/**
	 * Prints log messages depending on the debug level passed in.
	 */
	debug?: LogLevel;
	/**
	 * Server host. Defaults to `0.peerjs.com`.
	 * Also accepts `'/'` to signify relative hostname.
	 */
	host?: string;
	/**
	 * Server port. Defaults to `443`.
	 */
	port?: number;
	/**
	 * The path where your self-hosted PeerServer is running. Defaults to `'/'`
	 */
	path?: string;
	/**
	 * API key for the PeerServer.
	 * This is not used anymore.
	 * @deprecated
	 */
	key?: string;
	token?: string;
	/**
	 * Configuration hash passed to RTCPeerConnection.
	 * This hash contains any custom ICE/TURN server configuration.
	 *
	 * Defaults to {@apilink util.defaultConfig}
	 */
	config?: any;
	/**
	 * Set to true `true` if you're using TLS.
	 * :::danger
	 * If possible *always use TLS*
	 * :::
	 */
	secure?: boolean;
	pingInterval?: number;
	referrerPolicy?: ReferrerPolicy;
	logFunction?: (logLevel: LogLevel, ...rest: any[]) => void;
	serializers?: SerializerMapping;
}

export { type PeerOptions };

export interface SerializerMapping {
	[key: string]: new (
		peerId: string,
		provider: Peer,
		options: any,
	) => DataConnection;
}

export interface PeerEvents {
	/**
	 * Emitted when a connection to the PeerServer is established.
	 *
	 * You may use the peer before this is emitted, but messages to the server will be queued. <code>id</code> is the brokering ID of the peer (which was either provided in the constructor or assigned by the server).<span class='tip'>You should not wait for this event before connecting to other peers if connection speed is important.</span>
	 */
	open: (id: string) => void;
	/**
	 * Emitted when a new data connection is established from a remote peer.
	 */
	connection: (dataConnection: DataConnection) => void;
	/**
	 * Emitted when a remote peer attempts to call you.
	 */
	call: (mediaConnection: MediaConnection) => void;
	/**
	 * Emitted when the peer is destroyed and can no longer accept or create any new connections.
	 */
	close: () => void;
	/**
	 * Emitted when the peer is disconnected from the signalling server
	 */
	disconnected: (currentId: string) => void;
	/**
	 * Errors on the peer are almost always fatal and will destroy the peer.
	 *
	 * Errors from the underlying socket and PeerConnections are forwarded here.
	 */
	error: (error: PeerError<`${PeerErrorType}`>) => void;
}
/**
 * A peer who can initiate connections with other peers.
 */
export class Peer extends EventEmitterWithError<PeerErrorType, PeerEvents> {
	private static readonly DEFAULT_KEY = "peerjs";

	protected readonly _serializers: SerializerMapping = {
		raw: Raw,
		json: Json,
		binary: BinaryPack,
		"binary-utf8": BinaryPack,

		default: BinaryPack,
	};
	private readonly _options: PeerOptions;
	private readonly _api: API;
	private readonly _socket: Socket;

	private _id: string | null = null;
	private _lastServerId: string | null = null;

	// States.
	private _destroyed = false; // Connections have been killed
	private _disconnected = false; // Connection to PeerServer killed but P2P connections still active
	private _open = false; // Sockets and such are not yet open.
	private readonly _connections: Map<
		string,
		(DataConnection | MediaConnection)[]
	> = new Map(); // All connections for this peer.
	private readonly _lostMessages: Map<string, ServerMessage[]> = new Map(); // src => [list of messages]
	/**
	 * The brokering ID of this peer
	 *
	 * If no ID was specified in {@apilink Peer | the constructor},
	 * this will be `undefined` until the {@apilink PeerEvents | `open`} event is emitted.
	 */
	get id() {
		return this._id;
	}

	get options() {
		return this._options;
	}

	get open() {
		return this._open;
	}

	/**
	 * @internal
	 */
	get socket() {
		return this._socket;
	}

	/**
	 * A hash of all connections associated with this peer, keyed by the remote peer's ID.
	 * @deprecated
	 * Return type will change from Object to Map<string,[]>
	 */
	get connections(): Object {
		const plainConnections = Object.create(null);

		for (const [k, v] of this._connections) {
			plainConnections[k] = v;
		}

		return plainConnections;
	}

	/**
	 * true if this peer and all of its connections can no longer be used.
	 */
	get destroyed() {
		return this._destroyed;
	}
	/**
	 * false if there is an active connection to the PeerServer.
	 */
	get disconnected() {
		return this._disconnected;
	}

	/**
	 * A peer can connect to other peers and listen for connections.
	 */
	constructor();

	/**
	 * A peer can connect to other peers and listen for connections.
	 * @param options for specifying details about PeerServer
	 */
	constructor(options: PeerOptions);

	/**
	 * A peer can connect to other peers and listen for connections.
	 * @param id Other peers can connect to this peer using the provided ID.
	 *     If no ID is given, one will be generated by the brokering server.
	 * The ID must start and end with an alphanumeric character (lower or upper case character or a digit). In the middle of the ID spaces, dashes (-) and underscores (_) are allowed. Use {@apilink PeerOptions.metadata } to send identifying information.
	 * @param options for specifying details about PeerServer
	 */
	constructor(id: string, options?: PeerOptions);

	constructor(id?: string | PeerOptions, options?: PeerOptions) {
		super();

		let userId: string | undefined;

		// Deal with overloading
		if (id && id.constructor == Object) {
			options = id as PeerOptions;
		} else if (id) {
			userId = id.toString();
		}

		// Configurize options
		options = {
			debug: 0, // 1: Errors, 2: Warnings, 3: All logs
			host: util.CLOUD_HOST,
			port: util.CLOUD_PORT,
			path: "/",
			key: Peer.DEFAULT_KEY,
			token: util.randomToken(),
			config: util.defaultConfig,
			referrerPolicy: "strict-origin-when-cross-origin",
			serializers: {},
			...options,
		};
		this._options = options;
		this._serializers = { ...this._serializers, ...this.options.serializers };

		// Detect relative URL host.
		if (this._options.host === "/") {
			this._options.host = window.location.hostname;
		}

		// Set path correctly.
		if (this._options.path) {
			if (this._options.path[0] !== "/") {
				this._options.path = "/" + this._options.path;
			}
			if (this._options.path[this._options.path.length - 1] !== "/") {
				this._options.path += "/";
			}
		}

		// Set whether we use SSL to same as current host
		if (
			this._options.secure === undefined &&
			this._options.host !== util.CLOUD_HOST
		) {
			this._options.secure = util.isSecure();
		} else if (this._options.host == util.CLOUD_HOST) {
			this._options.secure = true;
		}
		// Set a custom log function if present
		if (this._options.logFunction) {
			logger.setLogFunction(this._options.logFunction);
		}

		logger.logLevel = this._options.debug || 0;

		this._api = new API(options);
		this._socket = this._createServerConnection();

		// Sanity checks
		// Ensure WebRTC supported
		if (!util.supports.audioVideo && !util.supports.data) {
			this._delayedAbort(
				PeerErrorType.BrowserIncompatible,
				"The current browser does not support WebRTC",
			);
			return;
		}

		// Ensure alphanumeric id
		if (!!userId && !util.validateId(userId)) {
			this._delayedAbort(PeerErrorType.InvalidID, `ID "${userId}" is invalid`);
			return;
		}

		if (userId) {
			this._initialize(userId);
		} else {
			this._api
				.retrieveId()
				.then((id) => this._initialize(id))
				.catch((error) => this._abort(PeerErrorType.ServerError, error));
		}
	}

	private _createServerConnection(): Socket {
		const socket = new Socket(
			this._options.secure,
			this._options.host!,
			this._options.port!,
			this._options.path!,
			this._options.key!,
			this._options.pingInterval,
		);

		socket.on(SocketEventType.Message, (data: ServerMessage) => {
			this._handleMessage(data);
		});

		socket.on(SocketEventType.Error, (error: string) => {
			this._abort(PeerErrorType.SocketError, error);
		});

		socket.on(SocketEventType.Disconnected, () => {
			if (this.disconnected) {
				return;
			}

			this.emitError(PeerErrorType.Network, "Lost connection to server.");
			this.disconnect();
		});

		socket.on(SocketEventType.Close, () => {
			if (this.disconnected) {
				return;
			}

			this._abort(
				PeerErrorType.SocketClosed,
				"Underlying socket is already closed.",
			);
		});

		return socket;
	}

	/** Initialize a connection with the server. */
	private _initialize(id: string): void {
		this._id = id;
		this.socket.start(id, this._options.token!);
	}

	/** Handles messages from the server. */
	private _handleMessage(message: ServerMessage): void {
		const type = message.type;
		const payload = message.payload;
		const peerId = message.src;

		switch (type) {
			case ServerMessageType.Open: // The connection to the server is open.
				this._lastServerId = this.id;
				this._open = true;
				this.emit("open", this.id);
				break;
			case ServerMessageType.Error: // Server error.
				this._abort(PeerErrorType.ServerError, payload.msg);
				break;
			case ServerMessageType.IdTaken: // The selected ID is taken.
				this._abort(PeerErrorType.UnavailableID, `ID "${this.id}" is taken`);
				break;
			case ServerMessageType.InvalidKey: // The given API key cannot be found.
				this._abort(
					PeerErrorType.InvalidKey,
					`API KEY "${this._options.key}" is invalid`,
				);
				break;
			case ServerMessageType.Leave: // Another peer has closed its connection to this peer.
				logger.log(`Received leave message from ${peerId}`);
				this._cleanupPeer(peerId);
				this._connections.delete(peerId);
				break;
			case ServerMessageType.Expire: // The offer sent to a peer has expired without response.
				this.emitError(
					PeerErrorType.PeerUnavailable,
					`Could not connect to peer ${peerId}`,
				);
				break;
			case ServerMessageType.Offer: {
				// we should consider switching this to CALL/CONNECT, but this is the least breaking option.
				const connectionId = payload.connectionId;
				let connection = this.getConnection(peerId, connectionId);

				if (connection) {
					connection.close();
					logger.warn(
						`Offer received for existing Connection ID:${connectionId}`,
					);
				}

				// Create a new connection.
				if (payload.type === ConnectionType.Media) {
					const mediaConnection = new MediaConnection(peerId, this, {
						connectionId: connectionId,
						_payload: payload,
						metadata: payload.metadata,
					});
					connection = mediaConnection;
					this._addConnection(peerId, connection);
					this.emit("call", mediaConnection);
				} else if (payload.type === ConnectionType.Data) {
					const dataConnection = new this._serializers[payload.serialization](
						peerId,
						this,
						{
							connectionId: connectionId,
							_payload: payload,
							metadata: payload.metadata,
							label: payload.label,
							serialization: payload.serialization,
							reliable: payload.reliable,
						},
					);
					connection = dataConnection;

					this._addConnection(peerId, connection);
					this.emit("connection", dataConnection);
				} else {
					logger.warn(`Received malformed connection type:${payload.type}`);
					return;
				}

				// Find messages.
				const messages = this._getMessages(connectionId);
				for (const message of messages) {
					connection.handleMessage(message);
				}

				break;
			}
			default: {
				if (!payload) {
					logger.warn(
						`You received a malformed message from ${peerId} of type ${type}`,
					);
					return;
				}

				const connectionId = payload.connectionId;
				const connection = this.getConnection(peerId, connectionId);

				if (connection && connection.peerConnection) {
					// Pass it on.
					connection.handleMessage(message);
				} else if (connectionId) {
					// Store for possible later use
					this._storeMessage(connectionId, message);
				} else {
					logger.warn("You received an unrecognized message:", message);
				}
				break;
			}
		}
	}

	/** Stores messages without a set up connection, to be claimed later. */
	private _storeMessage(connectionId: string, message: ServerMessage): void {
		if (!this._lostMessages.has(connectionId)) {
			this._lostMessages.set(connectionId, []);
		}

		this._lostMessages.get(connectionId).push(message);
	}

	/**
	 * Retrieve messages from lost message store
	 * @internal
	 */
	//TODO Change it to private
	public _getMessages(connectionId: string): ServerMessage[] {
		const messages = this._lostMessages.get(connectionId);

		if (messages) {
			this._lostMessages.delete(connectionId);
			return messages;
		}

		return [];
	}

	/**
	 * Connects to the remote peer specified by id and returns a data connection.
	 * @param peer The brokering ID of the remote peer (their {@apilink Peer.id}).
	 * @param options for specifying details about Peer Connection
	 */
	connect(peer: string, options: PeerConnectOption = {}): DataConnection {
		options = {
			serialization: "default",
			...options,
		};
		if (this.disconnected) {
			logger.warn(
				"You cannot connect to a new Peer because you called " +
					".disconnect() on this Peer and ended your connection with the " +
					"server. You can create a new Peer to reconnect, or call reconnect " +
					"on this peer if you believe its ID to still be available.",
			);
			this.emitError(
				PeerErrorType.Disconnected,
				"Cannot connect to new Peer after disconnecting from server.",
			);
			return;
		}

		const dataConnection = new this._serializers[options.serialization](
			peer,
			this,
			options,
		);
		this._addConnection(peer, dataConnection);
		return dataConnection;
	}

	/**
	 * Calls the remote peer specified by id and returns a media connection.
	 * @param peer The brokering ID of the remote peer (their peer.id).
	 * @param stream The caller's media stream
	 * @param options Metadata associated with the connection, passed in by whoever initiated the connection.
	 */
	call(
		peer: string,
		stream: MediaStream,
		options: CallOption = {},
	): MediaConnection {
		if (this.disconnected) {
			logger.warn(
				"You cannot connect to a new Peer because you called " +
					".disconnect() on this Peer and ended your connection with the " +
					"server. You can create a new Peer to reconnect.",
			);
			this.emitError(
				PeerErrorType.Disconnected,
				"Cannot connect to new Peer after disconnecting from server.",
			);
			return;
		}

		if (!stream) {
			logger.error(
				"To call a peer, you must provide a stream from your browser's `getUserMedia`.",
			);
			return;
		}

		const mediaConnection = new MediaConnection(peer, this, {
			...options,
			_stream: stream,
		});
		this._addConnection(peer, mediaConnection);
		return mediaConnection;
	}

	/** Add a data/media connection to this peer. */
	private _addConnection(
		peerId: string,
		connection: MediaConnection | DataConnection,
	): void {
		logger.log(
			`add connection ${connection.type}:${connection.connectionId} to peerId:${peerId}`,
		);

		if (!this._connections.has(peerId)) {
			this._connections.set(peerId, []);
		}
		this._connections.get(peerId).push(connection);
	}

	//TODO should be private
	_removeConnection(connection: DataConnection | MediaConnection): void {
		const connections = this._connections.get(connection.peer);

		if (connections) {
			const index = connections.indexOf(connection);

			if (index !== -1) {
				connections.splice(index, 1);
			}
		}

		//remove from lost messages
		this._lostMessages.delete(connection.connectionId);
	}

	/** Retrieve a data/media connection for this peer. */
	getConnection(
		peerId: string,
		connectionId: string,
	): null | DataConnection | MediaConnection {
		const connections = this._connections.get(peerId);
		if (!connections) {
			return null;
		}

		for (const connection of connections) {
			if (connection.connectionId === connectionId) {
				return connection;
			}
		}

		return null;
	}

	private _delayedAbort(type: PeerErrorType, message: string | Error): void {
		setTimeout(() => {
			this._abort(type, message);
		}, 0);
	}

	/**
	 * Emits an error message and destroys the Peer.
	 * The Peer is not destroyed if it's in a disconnected state, in which case
	 * it retains its disconnected state and its existing connections.
	 */
	private _abort(type: PeerErrorType, message: string | Error): void {
		logger.error("Aborting!");

		this.emitError(type, message);

		if (!this._lastServerId) {
			this.destroy();
		} else {
			this.disconnect();
		}
	}

	/**
	 * Destroys the Peer: closes all active connections as well as the connection
	 * to the server.
	 *
	 * :::caution
	 * This cannot be undone; the respective peer object will no longer be able
	 * to create or receive any connections, its ID will be forfeited on the server,
	 * and all of its data and media connections will be closed.
	 * :::
	 */
	destroy(): void {
		if (this.destroyed) {
			return;
		}

		logger.log(`Destroy peer with ID:${this.id}`);

		this.disconnect();
		this._cleanup();

		this._destroyed = true;

		this.emit("close");
	}

	/** Disconnects every connection on this peer. */
	private _cleanup(): void {
		for (const peerId of this._connections.keys()) {
			this._cleanupPeer(peerId);
			this._connections.delete(peerId);
		}

		this.socket.removeAllListeners();
	}

	/** Closes all connections to this peer. */
	private _cleanupPeer(peerId: string): void {
		const connections = this._connections.get(peerId);

		if (!connections) return;

		for (const connection of connections) {
			connection.close();
		}
	}

	/**
	 * Disconnects the Peer's connection to the PeerServer. Does not close any
	 *  active connections.
	 * Warning: The peer can no longer create or accept connections after being
	 *  disconnected. It also cannot reconnect to the server.
	 */
	disconnect(): void {
		if (this.disconnected) {
			return;
		}

		const currentId = this.id;

		logger.log(`Disconnect peer with ID:${currentId}`);

		this._disconnected = true;
		this._open = false;

		this.socket.close();

		this._lastServerId = currentId;
		this._id = null;

		this.emit("disconnected", currentId);
	}

	/** Attempts to reconnect with the same ID.
	 *
	 * Only {@apilink Peer.disconnect | disconnected peers} can be reconnected.
	 * Destroyed peers cannot be reconnected.
	 * If the connection fails (as an example, if the peer's old ID is now taken),
	 * the peer's existing connections will not close, but any associated errors events will fire.
	 */
	reconnect(): void {
		if (this.disconnected && !this.destroyed) {
			logger.log(
				`Attempting reconnection to server with ID ${this._lastServerId}`,
			);
			this._disconnected = false;
			this._initialize(this._lastServerId!);
		} else if (this.destroyed) {
			throw new Error(
				"This peer cannot reconnect to the server. It has already been destroyed.",
			);
		} else if (!this.disconnected && !this.open) {
			// Do nothing. We're still connecting the first time.
			logger.error(
				"In a hurry? We're still trying to make the initial connection!",
			);
		} else {
			throw new Error(
				`Peer ${this.id} cannot reconnect because it is not disconnected from the server!`,
			);
		}
	}

	/**
	 * Get a list of available peer IDs. If you're running your own server, you'll
	 * want to set allow_discovery: true in the PeerServer options. If you're using
	 * the cloud server, email team@peerjs.com to get the functionality enabled for
	 * your key.
	 */
	listAllPeers(cb = (_: any[]) => {}): void {
		this._api
			.listAllPeers()
			.then((peers) => cb(peers))
			.catch((error) => this._abort(PeerErrorType.ServerError, error));
	}
}



================================================
FILE: lib/peerError.ts
================================================
import { EventEmitter } from "eventemitter3";
import logger from "./logger";

export interface EventsWithError<ErrorType extends string> {
	error: (error: PeerError<`${ErrorType}`>) => void;
}

export class EventEmitterWithError<
	ErrorType extends string,
	Events extends EventsWithError<ErrorType>,
> extends EventEmitter<Events, never> {
	/**
	 * Emits a typed error message.
	 *
	 * @internal
	 */
	emitError(type: ErrorType, err: string | Error): void {
		logger.error("Error:", err);

		// @ts-ignore
		this.emit("error", new PeerError<`${ErrorType}`>(`${type}`, err));
	}
}
/**
 * A PeerError is emitted whenever an error occurs.
 * It always has a `.type`, which can be used to identify the error.
 */
export class PeerError<T extends string> extends Error {
	/**
	 * @internal
	 */
	constructor(type: T, err: Error | string) {
		if (typeof err === "string") {
			super(err);
		} else {
			super();
			Object.assign(this, err);
		}

		this.type = type;
	}

	public type: T;
}



================================================
FILE: lib/servermessage.ts
================================================
import type { ServerMessageType } from "./enums";

export class ServerMessage {
	type: ServerMessageType;
	payload: any;
	src: string;
}



================================================
FILE: lib/socket.ts
================================================
import { EventEmitter } from "eventemitter3";
import logger from "./logger";
import { ServerMessageType, SocketEventType } from "./enums";
import { version } from "./version";

/**
 * An abstraction on top of WebSockets to provide fastest
 * possible connection for peers.
 */
export class Socket extends EventEmitter {
	private _disconnected: boolean = true;
	private _id?: string;
	private _messagesQueue: Array<object> = [];
	private _socket?: WebSocket;
	private _wsPingTimer?: any;
	private readonly _baseUrl: string;

	constructor(
		secure: any,
		host: string,
		port: number,
		path: string,
		key: string,
		private readonly pingInterval: number = 5000,
	) {
		super();

		const wsProtocol = secure ? "wss://" : "ws://";

		this._baseUrl = wsProtocol + host + ":" + port + path + "peerjs?key=" + key;
	}

	start(id: string, token: string): void {
		this._id = id;

		const wsUrl = `${this._baseUrl}&id=${id}&token=${token}`;

		if (!!this._socket || !this._disconnected) {
			return;
		}

		this._socket = new WebSocket(wsUrl + "&version=" + version);
		this._disconnected = false;

		this._socket.onmessage = (event) => {
			let data;

			try {
				data = JSON.parse(event.data);
				logger.log("Server message received:", data);
			} catch (e) {
				logger.log("Invalid server message", event.data);
				return;
			}

			this.emit(SocketEventType.Message, data);
		};

		this._socket.onclose = (event) => {
			if (this._disconnected) {
				return;
			}

			logger.log("Socket closed.", event);

			this._cleanup();
			this._disconnected = true;

			this.emit(SocketEventType.Disconnected);
		};

		// Take care of the queue of connections if necessary and make sure Peer knows
		// socket is open.
		this._socket.onopen = () => {
			if (this._disconnected) {
				return;
			}

			this._sendQueuedMessages();

			logger.log("Socket open");

			this._scheduleHeartbeat();
		};
	}

	private _scheduleHeartbeat(): void {
		this._wsPingTimer = setTimeout(() => {
			this._sendHeartbeat();
		}, this.pingInterval);
	}

	private _sendHeartbeat(): void {
		if (!this._wsOpen()) {
			logger.log(`Cannot send heartbeat, because socket closed`);
			return;
		}

		const message = JSON.stringify({ type: ServerMessageType.Heartbeat });

		this._socket!.send(message);

		this._scheduleHeartbeat();
	}

	/** Is the websocket currently open? */
	private _wsOpen(): boolean {
		return !!this._socket && this._socket.readyState === 1;
	}

	/** Send queued messages. */
	private _sendQueuedMessages(): void {
		//Create copy of queue and clear it,
		//because send method push the message back to queue if smth will go wrong
		const copiedQueue = [...this._messagesQueue];
		this._messagesQueue = [];

		for (const message of copiedQueue) {
			this.send(message);
		}
	}

	/** Exposed send for DC & Peer. */
	send(data: any): void {
		if (this._disconnected) {
			return;
		}

		// If we didn't get an ID yet, we can't yet send anything so we should queue
		// up these messages.
		if (!this._id) {
			this._messagesQueue.push(data);
			return;
		}

		if (!data.type) {
			this.emit(SocketEventType.Error, "Invalid message");
			return;
		}

		if (!this._wsOpen()) {
			return;
		}

		const message = JSON.stringify(data);

		this._socket!.send(message);
	}

	close(): void {
		if (this._disconnected) {
			return;
		}

		this._cleanup();

		this._disconnected = true;
	}

	private _cleanup(): void {
		if (this._socket) {
			this._socket.onopen =
				this._socket.onmessage =
				this._socket.onclose =
					null;
			this._socket.close();
			this._socket = undefined;
		}

		clearTimeout(this._wsPingTimer!);
	}
}



================================================
FILE: lib/supports.ts
================================================
import webRTCAdapter_import from "webrtc-adapter";

const webRTCAdapter: typeof webRTCAdapter_import =
	//@ts-ignore
	webRTCAdapter_import.default || webRTCAdapter_import;

export const Supports = new (class {
	readonly isIOS =
		typeof navigator !== "undefined"
			? ["iPad", "iPhone", "iPod"].includes(navigator.platform)
			: false;
	readonly supportedBrowsers = ["firefox", "chrome", "safari"];

	readonly minFirefoxVersion = 59;
	readonly minChromeVersion = 72;
	readonly minSafariVersion = 605;

	isWebRTCSupported(): boolean {
		return typeof RTCPeerConnection !== "undefined";
	}

	isBrowserSupported(): boolean {
		const browser = this.getBrowser();
		const version = this.getVersion();

		const validBrowser = this.supportedBrowsers.includes(browser);

		if (!validBrowser) return false;

		if (browser === "chrome") return version >= this.minChromeVersion;
		if (browser === "firefox") return version >= this.minFirefoxVersion;
		if (browser === "safari")
			return !this.isIOS && version >= this.minSafariVersion;

		return false;
	}

	getBrowser(): string {
		return webRTCAdapter.browserDetails.browser;
	}

	getVersion(): number {
		return webRTCAdapter.browserDetails.version || 0;
	}

	isUnifiedPlanSupported(): boolean {
		const browser = this.getBrowser();
		const version = webRTCAdapter.browserDetails.version || 0;

		if (browser === "chrome" && version < this.minChromeVersion) return false;
		if (browser === "firefox" && version >= this.minFirefoxVersion) return true;
		if (
			!window.RTCRtpTransceiver ||
			!("currentDirection" in RTCRtpTransceiver.prototype)
		)
			return false;

		let tempPc: RTCPeerConnection;
		let supported = false;

		try {
			tempPc = new RTCPeerConnection();
			tempPc.addTransceiver("audio");
			supported = true;
		} catch (e) {
		} finally {
			if (tempPc) {
				tempPc.close();
			}
		}

		return supported;
	}

	toString(): string {
		return `Supports:
    browser:${this.getBrowser()}
    version:${this.getVersion()}
    isIOS:${this.isIOS}
    isWebRTCSupported:${this.isWebRTCSupported()}
    isBrowserSupported:${this.isBrowserSupported()}
    isUnifiedPlanSupported:${this.isUnifiedPlanSupported()}`;
	}
})();



================================================
FILE: lib/util.ts
================================================
import { BinaryPackChunker } from "./dataconnection/BufferedConnection/binaryPackChunker";
import * as BinaryPack from "peerjs-js-binarypack";
import { Supports } from "./supports";
import { validateId } from "./utils/validateId";
import { randomToken } from "./utils/randomToken";

export interface UtilSupportsObj {
	/**
	 * The current browser.
	 * This property can be useful in determining whether two peers can connect.
	 *
	 * ```ts
	 * if (util.browser === 'firefox') {
	 *  // OK to peer with Firefox peers.
	 * }
	 * ```
	 *
	 * `util.browser` can currently have the values
	 * `'firefox', 'chrome', 'safari', 'edge', 'Not a supported browser.', 'Not a browser.' (unknown WebRTC-compatible agent).
	 */
	browser: boolean;
	webRTC: boolean;
	/**
	 * True if the current browser supports media streams and PeerConnection.
	 */
	audioVideo: boolean;
	/**
	 * True if the current browser supports DataChannel and PeerConnection.
	 */
	data: boolean;
	binaryBlob: boolean;
	/**
	 * True if the current browser supports reliable DataChannels.
	 */
	reliable: boolean;
}

const DEFAULT_CONFIG = {
	iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
		{
			urls: [
				"turn:eu-0.turn.peerjs.com:3478",
				"turn:us-0.turn.peerjs.com:3478",
			],
			username: "peerjs",
			credential: "peerjsp",
		},
	],
	sdpSemantics: "unified-plan",
};

export class Util extends BinaryPackChunker {
	noop(): void {}

	readonly CLOUD_HOST = "0.peerjs.com";
	readonly CLOUD_PORT = 443;

	// Browsers that need chunking:
	readonly chunkedBrowsers = { Chrome: 1, chrome: 1 };

	// Returns browser-agnostic default config
	readonly defaultConfig = DEFAULT_CONFIG;

	readonly browser = Supports.getBrowser();
	readonly browserVersion = Supports.getVersion();

	pack = BinaryPack.pack;
	unpack = BinaryPack.unpack;

	/**
	 * A hash of WebRTC features mapped to booleans that correspond to whether the feature is supported by the current browser.
	 *
	 * :::caution
	 * Only the properties documented here are guaranteed to be present on `util.supports`
	 * :::
	 */
	readonly supports = (function () {
		const supported: UtilSupportsObj = {
			browser: Supports.isBrowserSupported(),
			webRTC: Supports.isWebRTCSupported(),
			audioVideo: false,
			data: false,
			binaryBlob: false,
			reliable: false,
		};

		if (!supported.webRTC) return supported;

		let pc: RTCPeerConnection;

		try {
			pc = new RTCPeerConnection(DEFAULT_CONFIG);

			supported.audioVideo = true;

			let dc: RTCDataChannel;

			try {
				dc = pc.createDataChannel("_PEERJSTEST", { ordered: true });
				supported.data = true;
				supported.reliable = !!dc.ordered;

				// Binary test
				try {
					dc.binaryType = "blob";
					supported.binaryBlob = !Supports.isIOS;
				} catch (e) {}
			} catch (e) {
			} finally {
				if (dc) {
					dc.close();
				}
			}
		} catch (e) {
		} finally {
			if (pc) {
				pc.close();
			}
		}

		return supported;
	})();

	// Ensure alphanumeric ids
	validateId = validateId;
	randomToken = randomToken;

	blobToArrayBuffer(
		blob: Blob,
		cb: (arg: ArrayBuffer | null) => void,
	): FileReader {
		const fr = new FileReader();

		fr.onload = function (evt) {
			if (evt.target) {
				cb(evt.target.result as ArrayBuffer);
			}
		};

		fr.readAsArrayBuffer(blob);

		return fr;
	}

	binaryStringToArrayBuffer(binary: string): ArrayBuffer | SharedArrayBuffer {
		const byteArray = new Uint8Array(binary.length);

		for (let i = 0; i < binary.length; i++) {
			byteArray[i] = binary.charCodeAt(i) & 0xff;
		}

		return byteArray.buffer;
	}
	isSecure(): boolean {
		return location.protocol === "https:";
	}
}

/**
 * Provides a variety of helpful utilities.
 *
 * :::caution
 * Only the utilities documented here are guaranteed to be present on `util`.
 * Undocumented utilities can be removed without warning.
 * We don't consider these to be breaking changes.
 * :::
 */
export const util = new Util();



================================================
FILE: lib/version.ts
================================================
export const version = "1.5.4";



================================================
FILE: lib/dataconnection/DataConnection.ts
================================================
import logger from "../logger";
import { Negotiator } from "../negotiator";
import {
	BaseConnectionErrorType,
	ConnectionType,
	DataConnectionErrorType,
	ServerMessageType,
} from "../enums";
import type { Peer } from "../peer";
import { BaseConnection, type BaseConnectionEvents } from "../baseconnection";
import type { ServerMessage } from "../servermessage";
import type { EventsWithError } from "../peerError";
import { randomToken } from "../utils/randomToken";

export interface DataConnectionEvents
	extends EventsWithError<DataConnectionErrorType | BaseConnectionErrorType>,
		BaseConnectionEvents<DataConnectionErrorType | BaseConnectionErrorType> {
	/**
	 * Emitted when data is received from the remote peer.
	 */
	data: (data: unknown) => void;
	/**
	 * Emitted when the connection is established and ready-to-use.
	 */
	open: () => void;
}

/**
 * Wraps a DataChannel between two Peers.
 */
export abstract class DataConnection extends BaseConnection<
	DataConnectionEvents,
	DataConnectionErrorType
> {
	protected static readonly ID_PREFIX = "dc_";
	protected static readonly MAX_BUFFERED_AMOUNT = 8 * 1024 * 1024;

	private _negotiator: Negotiator<DataConnectionEvents, this>;
	abstract readonly serialization: string;
	readonly reliable: boolean;

	public get type() {
		return ConnectionType.Data;
	}

	constructor(peerId: string, provider: Peer, options: any) {
		super(peerId, provider, options);

		this.connectionId =
			this.options.connectionId || DataConnection.ID_PREFIX + randomToken();

		this.label = this.options.label || this.connectionId;
		this.reliable = !!this.options.reliable;

		this._negotiator = new Negotiator(this);

		this._negotiator.startConnection(
			this.options._payload || {
				originator: true,
				reliable: this.reliable,
			},
		);
	}

	/** Called by the Negotiator when the DataChannel is ready. */
	override _initializeDataChannel(dc: RTCDataChannel): void {
		this.dataChannel = dc;

		this.dataChannel.onopen = () => {
			logger.log(`DC#${this.connectionId} dc connection success`);
			this._open = true;
			this.emit("open");
		};

		this.dataChannel.onmessage = (e) => {
			logger.log(`DC#${this.connectionId} dc onmessage:`, e.data);
			// this._handleDataMessage(e);
		};

		this.dataChannel.onclose = () => {
			logger.log(`DC#${this.connectionId} dc closed for:`, this.peer);
			this.close();
		};
	}

	/**
	 * Exposed functionality for users.
	 */

	/** Allows user to close connection. */
	close(options?: { flush?: boolean }): void {
		if (options?.flush) {
			this.send({
				__peerData: {
					type: "close",
				},
			});
			return;
		}
		if (this._negotiator) {
			this._negotiator.cleanup();
			this._negotiator = null;
		}

		if (this.provider) {
			this.provider._removeConnection(this);

			this.provider = null;
		}

		if (this.dataChannel) {
			this.dataChannel.onopen = null;
			this.dataChannel.onmessage = null;
			this.dataChannel.onclose = null;
			this.dataChannel = null;
		}

		if (!this.open) {
			return;
		}

		this._open = false;

		super.emit("close");
	}

	protected abstract _send(data: any, chunked: boolean): void | Promise<void>;

	/** Allows user to send data. */
	public send(data: any, chunked = false) {
		if (!this.open) {
			this.emitError(
				DataConnectionErrorType.NotOpenYet,
				"Connection is not open. You should listen for the `open` event before sending messages.",
			);
			return;
		}
		return this._send(data, chunked);
	}

	async handleMessage(message: ServerMessage) {
		const payload = message.payload;

		switch (message.type) {
			case ServerMessageType.Answer:
				await this._negotiator.handleSDP(message.type, payload.sdp);
				break;
			case ServerMessageType.Candidate:
				await this._negotiator.handleCandidate(payload.candidate);
				break;
			default:
				logger.warn(
					"Unrecognized message type:",
					message.type,
					"from peer:",
					this.peer,
				);
				break;
		}
	}
}



================================================
FILE: lib/dataconnection/BufferedConnection/BinaryPack.ts
================================================
import { BinaryPackChunker, concatArrayBuffers } from "./binaryPackChunker";
import logger from "../../logger";
import type { Peer } from "../../peer";
import { BufferedConnection } from "./BufferedConnection";
import { SerializationType } from "../../enums";
import { pack, type Packable, unpack } from "peerjs-js-binarypack";

export class BinaryPack extends BufferedConnection {
	private readonly chunker = new BinaryPackChunker();
	readonly serialization = SerializationType.Binary;

	private _chunkedData: {
		[id: number]: {
			data: Uint8Array[];
			count: number;
			total: number;
		};
	} = {};

	public override close(options?: { flush?: boolean }) {
		super.close(options);
		this._chunkedData = {};
	}

	constructor(peerId: string, provider: Peer, options: any) {
		super(peerId, provider, options);
	}

	// Handles a DataChannel message.
	protected override _handleDataMessage({ data }: { data: Uint8Array }): void {
		const deserializedData = unpack(data);

		// PeerJS specific message
		const peerData = deserializedData["__peerData"];
		if (peerData) {
			if (peerData.type === "close") {
				this.close();
				return;
			}

			// Chunked data -- piece things back together.
			// @ts-ignore
			this._handleChunk(deserializedData);
			return;
		}

		this.emit("data", deserializedData);
	}

	private _handleChunk(data: {
		__peerData: number;
		n: number;
		total: number;
		data: ArrayBuffer;
	}): void {
		const id = data.__peerData;
		const chunkInfo = this._chunkedData[id] || {
			data: [],
			count: 0,
			total: data.total,
		};

		chunkInfo.data[data.n] = new Uint8Array(data.data);
		chunkInfo.count++;
		this._chunkedData[id] = chunkInfo;

		if (chunkInfo.total === chunkInfo.count) {
			// Clean up before making the recursive call to `_handleDataMessage`.
			delete this._chunkedData[id];

			// We've received all the chunks--time to construct the complete data.
			// const data = new Blob(chunkInfo.data);
			const data = concatArrayBuffers(chunkInfo.data);
			this._handleDataMessage({ data });
		}
	}

	protected override _send(data: Packable, chunked: boolean) {
		const blob = pack(data);
		if (blob instanceof Promise) {
			return this._send_blob(blob);
		}

		if (!chunked && blob.byteLength > this.chunker.chunkedMTU) {
			this._sendChunks(blob);
			return;
		}

		this._bufferedSend(blob);
	}
	private async _send_blob(blobPromise: Promise<ArrayBufferLike>) {
		const blob = await blobPromise;
		if (blob.byteLength > this.chunker.chunkedMTU) {
			this._sendChunks(blob);
			return;
		}

		this._bufferedSend(blob);
	}

	private _sendChunks(blob: ArrayBuffer) {
		const blobs = this.chunker.chunk(blob);
		logger.log(`DC#${this.connectionId} Try to send ${blobs.length} chunks...`);

		for (const blob of blobs) {
			this.send(blob, true);
		}
	}
}



================================================
FILE: lib/dataconnection/BufferedConnection/binaryPackChunker.ts
================================================
export class BinaryPackChunker {
	readonly chunkedMTU = 16300; // The original 60000 bytes setting does not work when sending data from Firefox to Chrome, which is "cut off" after 16384 bytes and delivered individually.

	// Binary stuff

	private _dataCount: number = 1;

	chunk = (
		blob: ArrayBuffer,
	): { __peerData: number; n: number; total: number; data: Uint8Array }[] => {
		const chunks = [];
		const size = blob.byteLength;
		const total = Math.ceil(size / this.chunkedMTU);

		let index = 0;
		let start = 0;

		while (start < size) {
			const end = Math.min(size, start + this.chunkedMTU);
			const b = blob.slice(start, end);

			const chunk = {
				__peerData: this._dataCount,
				n: index,
				data: b,
				total,
			};

			chunks.push(chunk);

			start = end;
			index++;
		}

		this._dataCount++;

		return chunks;
	};
}

export function concatArrayBuffers(bufs: Uint8Array[]) {
	let size = 0;
	for (const buf of bufs) {
		size += buf.byteLength;
	}
	const result = new Uint8Array(size);
	let offset = 0;
	for (const buf of bufs) {
		result.set(buf, offset);
		offset += buf.byteLength;
	}
	return result;
}



================================================
FILE: lib/dataconnection/BufferedConnection/BufferedConnection.ts
================================================
import logger from "../../logger";
import { DataConnection } from "../DataConnection";

export abstract class BufferedConnection extends DataConnection {
	private _buffer: any[] = [];
	private _bufferSize = 0;
	private _buffering = false;

	public get bufferSize(): number {
		return this._bufferSize;
	}

	public override _initializeDataChannel(dc: RTCDataChannel) {
		super._initializeDataChannel(dc);
		this.dataChannel.binaryType = "arraybuffer";
		this.dataChannel.addEventListener("message", (e) =>
			this._handleDataMessage(e),
		);
	}

	protected abstract _handleDataMessage(e: MessageEvent): void;

	protected _bufferedSend(msg: ArrayBuffer): void {
		if (this._buffering || !this._trySend(msg)) {
			this._buffer.push(msg);
			this._bufferSize = this._buffer.length;
		}
	}

	// Returns true if the send succeeds.
	private _trySend(msg: ArrayBuffer): boolean {
		if (!this.open) {
			return false;
		}

		if (this.dataChannel.bufferedAmount > DataConnection.MAX_BUFFERED_AMOUNT) {
			this._buffering = true;
			setTimeout(() => {
				this._buffering = false;
				this._tryBuffer();
			}, 50);

			return false;
		}

		try {
			this.dataChannel.send(msg);
		} catch (e) {
			logger.error(`DC#:${this.connectionId} Error when sending:`, e);
			this._buffering = true;

			this.close();

			return false;
		}

		return true;
	}

	// Try to send the first message in the buffer.
	private _tryBuffer(): void {
		if (!this.open) {
			return;
		}

		if (this._buffer.length === 0) {
			return;
		}

		const msg = this._buffer[0];

		if (this._trySend(msg)) {
			this._buffer.shift();
			this._bufferSize = this._buffer.length;
			this._tryBuffer();
		}
	}

	public override close(options?: { flush?: boolean }) {
		if (options?.flush) {
			this.send({
				__peerData: {
					type: "close",
				},
			});
			return;
		}
		this._buffer = [];
		this._bufferSize = 0;
		super.close();
	}
}



================================================
FILE: lib/dataconnection/BufferedConnection/Json.ts
================================================
import { BufferedConnection } from "./BufferedConnection";
import { DataConnectionErrorType, SerializationType } from "../../enums";
import { util } from "../../util";

export class Json extends BufferedConnection {
	readonly serialization = SerializationType.JSON;
	private readonly encoder = new TextEncoder();
	private readonly decoder = new TextDecoder();

	stringify: (data: any) => string = JSON.stringify;
	parse: (data: string) => any = JSON.parse;

	// Handles a DataChannel message.
	protected override _handleDataMessage({ data }: { data: Uint8Array }): void {
		const deserializedData = this.parse(this.decoder.decode(data));

		// PeerJS specific message
		const peerData = deserializedData["__peerData"];
		if (peerData && peerData.type === "close") {
			this.close();
			return;
		}

		this.emit("data", deserializedData);
	}

	override _send(data, _chunked) {
		const encodedData = this.encoder.encode(this.stringify(data));
		if (encodedData.byteLength >= util.chunkedMTU) {
			this.emitError(
				DataConnectionErrorType.MessageToBig,
				"Message too big for JSON channel",
			);
			return;
		}
		this._bufferedSend(encodedData);
	}
}



================================================
FILE: lib/dataconnection/BufferedConnection/Raw.ts
================================================
import { BufferedConnection } from "./BufferedConnection";
import { SerializationType } from "../../enums";

export class Raw extends BufferedConnection {
	readonly serialization = SerializationType.None;

	protected _handleDataMessage({ data }) {
		super.emit("data", data);
	}

	override _send(data, _chunked) {
		this._bufferedSend(data);
	}
}



================================================
FILE: lib/dataconnection/StreamConnection/MsgPack.ts
================================================
import { decodeMultiStream, Encoder } from "@msgpack/msgpack";
import { StreamConnection } from "./StreamConnection.js";
import type { Peer } from "../../peer.js";

export class MsgPack extends StreamConnection {
	readonly serialization = "MsgPack";
	private _encoder = new Encoder();

	constructor(peerId: string, provider: Peer, options: any) {
		super(peerId, provider, options);

		(async () => {
			for await (const msg of decodeMultiStream(this._rawReadStream)) {
				// @ts-ignore
				if (msg.__peerData?.type === "close") {
					this.close();
					return;
				}
				this.emit("data", msg);
			}
		})();
	}

	protected override _send(data) {
		return this.writer.write(this._encoder.encode(data));
	}
}



================================================
FILE: lib/dataconnection/StreamConnection/StreamConnection.ts
================================================
import logger from "../../logger.js";
import type { Peer } from "../../peer.js";
import { DataConnection } from "../DataConnection.js";

export abstract class StreamConnection extends DataConnection {
	private _CHUNK_SIZE = 1024 * 8 * 4;
	private _splitStream = new TransformStream<Uint8Array>({
		transform: (chunk, controller) => {
			for (let split = 0; split < chunk.length; split += this._CHUNK_SIZE) {
				controller.enqueue(chunk.subarray(split, split + this._CHUNK_SIZE));
			}
		},
	});
	private _rawSendStream = new WritableStream<ArrayBuffer>({
		write: async (chunk, controller) => {
			const openEvent = new Promise((resolve) =>
				this.dataChannel.addEventListener("bufferedamountlow", resolve, {
					once: true,
				}),
			);

			// if we can send the chunk now, send it
			// if not, we wait until at least half of the sending buffer is free again
			await (this.dataChannel.bufferedAmount <=
				DataConnection.MAX_BUFFERED_AMOUNT - chunk.byteLength || openEvent);

			// TODO: what can go wrong here?
			try {
				this.dataChannel.send(chunk);
			} catch (e) {
				logger.error(`DC#:${this.connectionId} Error when sending:`, e);
				controller.error(e);
				this.close();
			}
		},
	});
	protected writer = this._splitStream.writable.getWriter();

	protected _rawReadStream = new ReadableStream<ArrayBuffer>({
		start: (controller) => {
			this.once("open", () => {
				this.dataChannel.addEventListener("message", (e) => {
					controller.enqueue(e.data);
				});
			});
		},
	});

	protected constructor(peerId: string, provider: Peer, options: any) {
		super(peerId, provider, { ...options, reliable: true });

		void this._splitStream.readable.pipeTo(this._rawSendStream);
	}

	public override _initializeDataChannel(dc) {
		super._initializeDataChannel(dc);
		this.dataChannel.binaryType = "arraybuffer";
		this.dataChannel.bufferedAmountLowThreshold =
			DataConnection.MAX_BUFFERED_AMOUNT / 2;
	}
}



================================================
FILE: lib/utils/randomToken.ts
================================================
export const randomToken = () => Math.random().toString(36).slice(2);



================================================
FILE: lib/utils/validateId.ts
================================================
export const validateId = (id: string): boolean => {
	// Allow empty ids
	return !id || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(id);
};



================================================
FILE: .github/FUNDING.yml
================================================
github: peers
open_collective: peer



================================================
FILE: .github/workflows/browserstack.yml
================================================
name: "BrowserStack Test"
on: [push, pull_request]

concurrency:
  group: browserstack
jobs:
  ubuntu-job:
    name: "BrowserStack Test on Ubuntu"
    runs-on: ubuntu-latest # Can be self-hosted runner also
    steps:
      - name: "BrowserStack Env Setup" # Invokes the setup-env action
        uses: browserstack/github-actions/setup-env@master
        with:
          username: ${{ secrets.BROWSERSTACK_USERNAME }}
          access-key: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}

      - name: "BrowserStack Local Tunnel Setup" # Invokes the setup-local action
        uses: browserstack/github-actions/setup-local@master
        with:
          local-testing: "start"
          local-logging-level: "all-logs"
          local-identifier: "random"

      # The next 3 steps are for building the web application to be tested and starting the web server on the runner environment

      - name: "Checkout the repository"
        uses: actions/checkout@v4

      - name: "Building web application to be tested"
        run: npm install && npm run build

      - name: "Running application under test"
        run: npx http-server -p 3000 --cors &

      - name: "Running test on BrowserStack" # Invokes the actual test script that would run on BrowserStack browsers
        run: npm run e2e:bstack # See sample test script above
        env:
          BYPASS_WAF: ${{ secrets.BYPASS_WAF }}

      - name: "BrowserStackLocal Stop" # Terminating the BrowserStackLocal tunnel connection
        uses: browserstack/github-actions/setup-local@master
        with:
          local-testing: "stop"



================================================
FILE: .github/workflows/codeql-analysis.yml
================================================
# For most projects, this workflow file will not need changing; you simply need
# to commit it to your repository.
#
# You may wish to alter this file to override the set of languages analyzed,
# or to provide custom queries or build logic.
#
# ******** NOTE ********
# We have attempted to detect the languages in your repository. Please check
# the `language` matrix defined below to confirm you have the correct set of
# supported CodeQL languages.
#
name: "CodeQL"

on:
  push:
    branches: [master, rc, stable]
  pull_request:
    # The branches below must be a subset of the branches above
    branches: [master]
  schedule:
    - cron: "15 2 * * 5"

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: ["javascript"]
        # CodeQL supports [ 'cpp', 'csharp', 'go', 'java', 'javascript', 'python', 'ruby' ]
        # Learn more about CodeQL language support at https://aka.ms/codeql-docs/language-support

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      # Initializes the CodeQL tools for scanning.
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          # If you wish to specify custom queries, you can do so here or in a config file.
          # By default, queries listed here will override any specified in a config file.
          # Prefix the list here with "+" to use these queries and those in the config file.

          # Details on CodeQL's query packs refer to : https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/configuring-code-scanning#using-queries-in-ql-packs
          # queries: security-extended,security-and-quality

      # Autobuild attempts to build any compiled languages  (C/C++, C#, or Java).
      # If this step fails, then you should remove it and run the build manually (see below)
      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      # ℹ️ Command-line programs to run using the OS shell.
      # 📚 See https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsrun

      #   If the Autobuild fails above, remove it and uncomment the following three lines.
      #   modify them (or add more) to build your code if your project, please refer to the EXAMPLE below for guidance.

      # - run: |
      #   echo "Run, Build Application using script"
      #   ./location_of_script_within_repo/buildscript.sh

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3



================================================
FILE: .github/workflows/prettier.yml
================================================
# From https://til.simonwillison.net/github-actions/prettier-github-actions
name: Check JavaScript for conformance with Prettier

on:
  push:
  pull_request:

jobs:
  prettier:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repo
        uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 16
          cache: "npm"
      - run: npm ci
      - name: Run prettier
        run: |-
          npm run format:check



================================================
FILE: .github/workflows/release.yml
================================================
name: Release
on:
  push:
    branches:
      - rc
      - stable
jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "lts/*"
      - name: Install dependencies
        run: npm ci
      - name: Import GPG key
        id: import_gpg
        uses: crazy-max/ghaction-import-gpg@v6
        with:
          gpg_private_key: ${{ secrets.GPG_PRIVATE_KEY }}
          passphrase: ${{ secrets.GPG_PASSPHRASE }}
          git_user_signingkey: true
          git_commit_gpgsign: true
      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GIT_COMMITTER_NAME: ${{ steps.import_gpg.outputs.name }}
          GIT_COMMITTER_EMAIL: ${{ steps.import_gpg.outputs.email }}
        run: npx semantic-release



================================================
FILE: .github/workflows/test.yml
================================================
# This workflow will do a clean installation of node dependencies, cache/restore them, build the source code and run tests across different versions of node
# For more information see: https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs

name: Node.js CI

on:
  push:
    branches: ["master"]
  pull_request:
    branches: ["master"]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/

    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"
      - run: npm ci
      - run: npm run check
      - run: npm run build
      # - run: npm run lint
      - run: npm run coverage
      - name: Publish code coverage to CodeClimate
        uses: paambaati/codeclimate-action@v6.0.0
        env:
          CC_TEST_REPORTER_ID: ${{secrets.CC_TEST_REPORTER_ID}}


