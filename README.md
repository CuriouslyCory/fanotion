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

## Usage

```bash
echo "Note content" | notion-cli add-note -n "Note Title"
```
