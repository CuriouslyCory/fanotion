# Notion CLI

An unofficial simple CLI for Notion.so

## Installation

```bash
cp .env.example .env
# Fill in the .env file with your Notion token
npm install
npm build
npm install -g .
```

## Usage

```bash
echo "Note content" | notion-cli add-note -n "Note Title"
```
