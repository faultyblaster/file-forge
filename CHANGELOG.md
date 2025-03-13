# Change Log

All notable changes to the "templator" extension will be documented in this file.

## [Unreleased] All the versions below are unreleased versions

## [0.0.5] - 2025-03-12

- Fixed a windows bug: Wrong path separator for a couple of methods
- Fixed a bug: Quick pick inconsistency while giving the file name
- Removed unnecessary code
- Added double verification for the `clicker`, which didn't behave as expected under certain conditions
- Added a new command for python script creation
- Added a new command for typescript package creation
- Minor modifications to the namespace generation for C#
- Changes to multiple templates for multiple languages

> Note: The version 0.0.5 will be the last version with the name `templator`, the name is still to be decided

## [0.0.4] - 2025-03-10

- Added file watcher for Cpp
- Added templates for TypeScript
- In the command palette, the language selection, and template selection options are now sorted alphabetically
- Removed logger, added a dependency for logging
- Improved documentation
- Dependencies updated, security vulnerabilities fixed
- Added input validation for file name and path
- Changed the Template Definitions
  - Now  it allows the property `Children`, which allows the creation of a second template (Not yet implemented)
  - Added the property `id` to the `Language` and `Template` objects
  - Added the property `description` to the `language` and `template` objects

## [0.0.3] - 2025-03-10

- Added file watcher, handles automatic ctx menu activation
- Added templates for C#, TS, Cpp and Python
- Code cleanup and refactoring
- Internal commands are hidden from the command palette, only the context menu is available
- Shortcuts added for file generation, and language selection: 'cs'
- Dependencies updated

## [0.0.2] 2025-03-03

- The extension is now ready for testing with the C# programming language, 7 basic templates added to it
- Namespace generation for C# is also ready for testing
- Added 1 simple template for TS and also 1 for python

## [0.0.1] - 2025-02-21

- Started the project, added basic functionality for file generation.

> Note: The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

**Note:** On 2025-03-12 I noticed the name `templator` was already taken on the marketplace, so the name will be changed to other name, but the code will remain the same. Probably on the version 0.0.5 the name will be decided. The github repository will also be renamed to whatever name is decided.
