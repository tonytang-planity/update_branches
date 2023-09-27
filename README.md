# How to use

## What is it for ?
To know when a branch is not up to date with another branch (usually master)

## Demo

Run the script : 
```bash
yarn build
yarn start
```

Result:
```bash
Feature: pointeuse_v2
[pointeuse_v2] - App: prowebapp
current branch : PLAN-10525/master
[pointeuse_v2][prowebapp][master...PLAN-9963/master] - 0 commit(s) behind
Switching back to branch : PLAN-10525/master


[pointeuse_v2][prowebapp][PLAN-9963/master...PLAN-10527/master] - 0 commit(s) behind
Switching back to branch : PLAN-10525/master


[pointeuse_v2][prowebapp][PLAN-9963/master...PLAN-10525/master] - 0 commit(s) behind
Switching back to branch : PLAN-10525/master


[pointeuse_v2] - App: proapp
current branch : PLAN-10525/master
[pointeuse_v2][proapp][master...PLAN-9963/master] - 0 commit(s) behind
Switching back to branch : PLAN-10525/master


[pointeuse_v2][proapp][PLAN-9963/master...PLAN-10527/master] - 0 commit(s) behind
Switching back to branch : PLAN-10525/master


[pointeuse_v2][proapp][PLAN-9963/master...PLAN-10525/master] - 0 commit(s) behind
Switching back to branch : PLAN-10525/master


[pointeuse_v2] - App: lambdas
current branch : PLAN-10527/master
[pointeuse_v2][lambdas][master...PLAN-9963/master] - 0 commit(s) behind
Switching back to branch : PLAN-10527/master


[pointeuse_v2][lambdas][PLAN-9963/master...PLAN-10527/master] - 0 commit(s) behind
Switching back to branch : PLAN-10527/master


[pointeuse_v2] - App: cloud-functions
current branch : PLAN-9963/master
[pointeuse_v2][cloud-functions][master...PLAN-9963/master] - 0 commit(s) behind
Switching back to branch : PLAN-9963/master


[pointeuse_v2] - App: pro-app-mobile
current branch : PLAN-9963/master
[pointeuse_v2][pro-app-mobile][master...PLAN-9963/master] - 0 commit(s) behind
Switching back to branch : PLAN-9963/master
```

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

## Known errors

- It throws an error when a branch does not exist anymore but that does not prevent the tool from working
- Sometimes, the `git stash` command does not work (primarily on pro-app because of the Podfile) and then the tool won't be able to `git pull`
