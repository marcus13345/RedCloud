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

There are 3 basic components to RedCloud:
- API Server
- Cron Jobs
- Electron UI



```shell
yarn install        # installs dependencies, and compiles required files.
yarn start          # runs in production mode
yarn dev            # recompile on the fly, and disable cron jobs
yarn server         # run in production mode, headless
```

## Configuration

After installation (`yarn install`), The server configuration file can be found at [options/local.json](options/local.json) and defaults for the file can be found in [options/defaults.json](options/defaults.json).

The files are deep merged, and undefined is never used, so deleting keys should not be necessary.

The configuration does not change the compilation process, so a recompile is not required upon changing it.