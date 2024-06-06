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

```bash
npm install
npm build
npm install -g .
```

## Commands

### `notion-cli store-note`

Stores a new note in Notion.

#### Usage

```bash
notion-cli store-note [options]
```

#### Options

- `-n, --name <name>`: Name of the note (default: "Untitled Note").
- `-c, --content <content>`: Note content if not piped.

#### Examples

- Store a note with a name and content provided via command line:

  ```bash
  notion-cli store-note -n "Meeting Notes" -c "Notes from today's meeting..."
  ```

- Store a note with content piped from another command:

  ```bash
  echo "Content from another command" | notion-cli store-note -n "Piped Note"
  ```

### `notion-cli yt-summary <uri>`

Creates a page in Notion with a summary of a YouTube video.

#### Usage

```bash
notion-cli yt-summary [options] <uri>
```

#### Arguments

- `<uri>`: The URL of the YouTube video to summarize.

#### Options

- `-m, --model <model>`: The model to use for summarization (default: "gpt-4o").`

#### Examples

- Create a summary page for a YouTube video:

  ```bash
  notion-cli yt-summary "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  ```

### Description of Commands

1. **store-note**:

   - This command stores a new note in Notion. You can specify the name of the note with the `-n` option and the content with the `-c` option. If content is not provided via the `-c` option, it can be piped from another command.
   - Example: `notion-cli store-note -n "Daily Log" -c "Today's log content..."`

2. **yt-summary**:
   - This command creates a new page in Notion with a summary of a specified YouTube video. It retrieves metadata and transcript of the video, generates a summary and wisdom, and stores them in a Notion page.
   - Example: `notion-cli yt-summary "https://www.youtube.com/watch?v=dQw4w9WgXcQ"`

### Detailed Examples

1. **Storing a Note with Command-Line Content**:

   - Command: `notion-cli store-note -n "Project Ideas" -c "Brainstorming session notes for new project ideas..."`
   - Description: Stores a note titled "Project Ideas" with the provided content.

2. **Storing a Note with Piped Content**:

   - Command: `echo "These are piped notes" | notion-cli store-note -n "Piped Notes"`
   - Description: Stores a note titled "Piped Notes" with content piped from the `echo` command.

3. **Summarize a YouTube video and store it as a Notion page**:
   - Command: `notion-cli yt-summary "https://www.youtube.com/watch?v=example"`
   - Description: Creates a Notion page with a summary and wisdom extracted from the specified YouTube video.
