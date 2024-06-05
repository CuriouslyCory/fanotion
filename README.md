# Notion CLI

An unofficial simple CLI for Notion.so

## Installation

```bash
cp .env.example .env
# Fill in the .env file with your Notion token, and the page ID you want to add notes to
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
notion-cli yt-summary <uri>
```

#### Arguments

- `<uri>`: The URL of the YouTube video to summarize.

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

3. **Creating a YouTube Summary Page**:
   - Command: `notion-cli yt-summary "https://www.youtube.com/watch?v=example"`
   - Description: Creates a Notion page with a summary and wisdom extracted from the specified YouTube video.
