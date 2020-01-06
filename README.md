# RedCloud

## Requirements
### macos
- **Python** -
you'll need to have python installed. It comes installed
by default, so you're probably okay, however, to check,
run `python -v`. Any 2.7 or 3.x version will work, not
4.0 and up.

### Windows
- **Bash** - 
the scripts in package will only work from a bash like shell
(git bash, WSL, Cygwin, etc.)

## Getting started

```shell
npm install            # to install dependencies (Do this first!)
npm start              # compile and run production mode
npm run production     # just run, dont compile
npm run dev            # recompile on the fly, and run in dev mode (with cron jobs paused)
npm run server         # run in production mode, headless
npm run dashboard      # run headless production, with a terminal monitoring ui
```

## Configuration

The server can be run with different options, Listed in [options/defaults.json](options/defaults.json)