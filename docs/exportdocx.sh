#!/bin/bash

# Create the "converted" directory if it doesn't already exist
if [ ! -d "converted" ]; then
  mkdir "converted"
fi

# Find all markdown files in the current directory and its subdirectories
find . -name "*.qmd" | while read filename; do
  # Use pandoc to convert the file to a .docx file
  pandoc "$filename" -o "${filename%.*}.docx"

  # Create the same directory structure under "converted" as the original file
  dir=$(dirname "$filename")
  mkdir -p "converted/$dir"

  # Move the converted file to the "converted" directory
  mv "${filename%.*}.docx" "converted/$dir"
done
