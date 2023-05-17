# How to use

## Installation

```bash
yarn install
```

## Configuration

Rename the file [repos_example.json](src/data/repos_example.json) to `repos.json` and add the repositories you want to check.

The most important fields are (project_name and app_name can be anything) :
- [project_name].[app_name].workdir: the directory where the repository is
- [project_name].[app_name].branches.left: the base branch
- [project_name].[app_name].branches.right: the branch you want to compare with the base branch

## Start the tool

```bash
yarn build
yarn start
```

