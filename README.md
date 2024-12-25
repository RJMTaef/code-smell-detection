# Code Smell Detection



## Description
A VScode extension that allows user to refactor Java code smells. The extension utilize DesigniteJava to detect code smells and chatGPT to refactor the code smells.

## How to run the extension

- Run "npx tsc" to compile the TS files into JS files from ./SRC into ./out folder

- If there is any problem, run "npx tsc --build --clean" to remove any compiled code and recompile with "npx tsc" again

- Press F5 on your keyboard to run the extension OR go to RUN AND DEBUG tab on the primary side bar(left of the screen, icon:play button & a bug) then click on the play button located at the top of the primary side bar.

- When a new vscode window pop up, enter ">CodeSmellDetection: Open Code Smell Tab" into the search bar at the top of the window.

## Git Rules

- Branch from develop not main 

- Create a new branch for every new user story/feature   

- Commit regularly with descriptive commit messages   

    - No: Add margin 

    - Yes: Add margin to nav items to prevent them from overlapping the logo 

- Always push to your own branch (not develop, not main)   

- Always do git status to check which branch you’re on before pushing 

- Assign at least two reviewers to your issue when you create a merge request (at least 1 senior/director) 

- Never merge your branch yourself unless instructed by seniors and directors

- Always merge develop into your branch before creating a merge request

- Merge to develop branch not main

- Develop branch will only be pushed to main at the end of the sprint

## Branch Naming Convention

- Feature-CSD-1-new-login 
- [Type]-[issue number]-[short-description] 
- [Type] of branch: 
    - Feature 
    - Bugfix 
    - Test 
    - Refactoring 

## Frequently Used Git Commands

```
cd code-small-detection
git clone [link] 
git checkout develop 
git branch [new-branch-name] 
git checkout [brnach-name] 
git status 
git pull origin develop 
git add .     OR git add [file name] 
git commit –m [message] 
```

### How to merge develop into your branch

```
git checkout develop 
git pull 
git checkout [your-branch-name] 
git merge develop
```

## Installation
Install the following software:
- 1. [Node.js]: https://nodejs.org/en/download/package-manager
- 2. [DesigniteJava]: https://www.designite-tools.com/

## Support

### Useful Links
- 1. 

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Built With

## Sources Used

### [File name] *Line [number]*

- Author:
- Link:

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.
