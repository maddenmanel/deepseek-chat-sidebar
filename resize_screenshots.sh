#!/bin/bash
# This script resizes screenshots to 1280x800 for Chrome Web Store
# Usage: Place your screenshots in the 'screenshots' folder and run this script

# Create screenshots directory if it doesn't exist
mkdir -p screenshots/resized

# Check if sips is available (Mac OS built-in)
if command -v sips &> /dev/null; then
    echo "Using sips to resize images..."
    
    # Loop through all PNG and JPG files in the screenshots directory
    for img in screenshots/*.png screenshots/*.jpg; do
        if [ -f "$img" ]; then
            filename=$(basename -- "$img")
            echo "Resizing $filename to 1280x800..."
            
            # Copy and resize the image while maintaining aspect ratio
            cp "$img" "screenshots/resized/$filename"
            sips -Z 1280 "screenshots/resized/$filename"
            
            # Get current dimensions
            width=$(sips -g pixelWidth "screenshots/resized/$filename" | grep pixelWidth | awk '{print $2}')
            height=$(sips -g pixelHeight "screenshots/resized/$filename" | grep pixelHeight | awk '{print $2}')
            
            echo "Resized to $width x $height"
        fi
    done
    
    echo "All screenshots have been resized and saved to screenshots/resized/"
else
    echo "Error: sips command not found. Please install ImageMagick or another image processing tool."
fi
