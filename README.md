# global-go-tasks README

This is an extension to use gotests using testify templates

## Features

Allow creation of tests via vs code for testify

## Package
```
npm run compile
vsce package
VERSION=0.0.4
code --install-extension global-go-tasks-$VERSION.vsix
```

## Requirements

Need to have a project that uses testify and gotests. Also, you need to have template from gotests testify installed under
- ~/.gotests/templates/testify

## Extension Settings
This extension contributes the following settings:

* `globalGoTasks.genGoTestifyTestsFile`: Go: Generate Testify Unit Tests For File
* `globalGoTasks.genGoTestifyTestsFunc`: Go: Generate Testify Unit Tests For Function

## Known Issues

No at the moment

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.3
- Small bug related to not waiting file to be created

### 0.0.2
- Refactor & fix for receivers

### 0.0.1
- Initial version

---
