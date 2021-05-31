# legacy-to-utf8

This tool can batch convert text files from old legacy systems such as the ZX Spectrum, Commodore 64, Atari 8-bits and Atari ST into UTF-8 files.

This is a very quicky-and-dirty tool that reads Unicode-style tables to map the character transforms.

Please note that while this project is MIT licensed, some of the tables provided have their own licenses. See each table file for their licence terms.

## Usage

```bash
node src/index.js *.TXT atarist converted/
``` 

The current formats are `atarist` (Atari ST), `atascii` (Atari 8-bit), `petscii-c64` (Commodore 64) and `zxspectrum` (ZX Spectrum). If you want to add more find a unicode mapping table and drop it into the `tables` folder.

### Options

- [--wrap n] - Force a line wrap at column **n**
- [--trim] - Trim whitespace from the end of each line

## Examples

To convert Spectrum Tasword 2/3 files into regular PC text;

```bash
node src/index.js *.T zxspectrum converted/ --wrap 64 --trim
```

## Limitations

- It performs large in-memory string concats instead of streaming buffers so it's inefficient but then you're only going to run it once so :shrug:
- Unmapped characters are passed through as-is. This could cause problems. If you don't like that you can comment that line out in the source.