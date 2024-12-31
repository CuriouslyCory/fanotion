# Notion + Fabric CLI

An unofficial simple CLI for combining the use of [notion](https://notion.so) and [fabric](https://github.com/danielmiessler/fabric/).

## What is this?

As I started playing around with fabric I found myself wanting to store my data in Notion. I developed this CLI to reduce the friction between common tasks I use fabric for and storing the data in Notion.

## Installation

[Install fabric](https://github.com/danielmiessler/fabric/tree/main?tab=readme-ov-file#quickstart)

```bash
# copy the .env.example file to .env
cp .env.example .env
```

You'll need to create a new integration in Notion to get a token. You can do this by going to [Notion's My Integrations page](https://www.notion.so/my-integrations) and creating a new integration. Once you have created the integration copy the Internal Integration Secret and paste it into the .env file under "NOTION_TOKEN".
After creating the integration, you'll need to share the page you want to add notes to with the integration. On the desired page click the "..." button in the top right corner, then click "Connect To" and search for the integration you created.

Now you can build the CLI and install it globally.

### npm

```bash
npm install
npm run build
npm install -g .
```

### pnpm

```bash
pnpm install
pnpm run build
pnpm link --global
```

> [!NOTE]
> 2024.06.05: I'm working on configuring for publishing to npm to streamline the installation process.

## Commands

### `fanotion store-note`

Stores a new note in Notion.

#### Usage

```bash
fanotion store-note [options]
```

#### Options

- `-n, --name <name>`: Name of the note (default: "Untitled Note").
- `-c, --content <content>`: Note content if not piped.

#### Examples

- Store a note with a name and content provided via command line:

  ```bash
  fanotion store-note -n "Meeting Notes" -c "Notes from today's meeting..."
  ```

- Store a note with content piped from another command:

  ```bash
  echo "Content from another command" | fanotion store-note -n "Piped Note"
  ```

- Store a note with content piped from fabric:

  ```bash
  yt --transcript https://youtu.be/MQmfSBdIfno?si=gf50RUHYXdU4qfS2 | fabric -p extract_wisdom | fanotion store-note -n "Wisdom: Function Calling with Opensource LLMs"
  ```

### `fanotion yt-summary <uri>`

Creates a page in Notion with a summary of a YouTube video.

#### Usage

```bash
fanotion yt-summary [options] <uri>
```

#### Arguments

- `<uri>`: The URL of the YouTube video to summarize.

#### Options

- `-m, --model <model>`: The model to use for summarization (default: "gpt-4o").`

#### Examples

- Create a summary page for a YouTube video:

  ```bash
  fanotion yt-summary https://www.youtube.com/live/GxnaWre7N4Y?si=_TPX6Iir_aqQ6WO_
  ```

### `fanotion page-summary <uri>`

Creates a page in Notion with a summary of a YouTube video.

#### Usage

```bash
fanotion page-summary [options] <uri>
```

#### Arguments

- `<uri>`: The URL of the YouTube video to summarize.

#### Options

- `-m, --model <model>`: The model to use for summarization (default: "gpt-4o").`

#### Examples

- Create a summary page for a web url:

  ```bash
  fanotion page-summary https://github.com/danielmiessler/fabric/blob/main/README.md
  ```

### Planned Features

- [ ] Publish to NPM for quick install.
- [ ] Add setup command instead.
- [ ] Add support for storing notes in different pages.
- [ ] Add auto categorization tool to help organize notes.
- [ ] Add prompt suggestion to automatically find the best tool for the job.
- [ ] Add support for storing notes in different databases.
