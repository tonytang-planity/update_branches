import repos from './data/repos.json'
import { SimpleGit, simpleGit } from 'simple-git'
import { Branch } from 'types/branch'
import { Entries, PartialDeep } from 'type-fest'

type Repos = Entries<typeof repos>

// Change to true to debug
const debug = false

const MAGENTA = '\x1b[35m%s\x1b[0m'
const RED = '\x1b[31m%s\x1b[0m'

async function main() {
    const features = Object.entries(repos) as Repos

    const branchesToUpdate = await pullBranchesAndGetNbCommitsBehind(features)

    console.log({
        branchesToUpdate: JSON.stringify(branchesToUpdate, null, ' '),
    })
}

main()

async function pullBranchesAndGetNbCommitsBehind(features: Repos) {
    let branchesToUpdate: PartialDeep<
        typeof repos,
        { recurseIntoArrays: true }
    > = {}

    for await (const [featureName, feature] of features) {
        console.log(`Feature: ${featureName}`)

        const apps = Object.entries(feature) as Entries<typeof feature>

        for await (const [appName, app] of apps) {
            console.log(`[${featureName}] - App: ${appName}`)

            const { branches, workdir } = app
            const git = simpleGit(workdir)

            for await (const { left, right } of branches) {
                if (debug) {
                    console.log(
                        `[${featureName}][${appName}] - Comparing ${left} with ${right}`
                    )
                }

                try {
                    // Fetching origin to have last commits
                    await pullBranches(git, left, right)

                    // Is right up-to-date with left ?
                    const nbCommitsBehind = await getNbCommitsBehind(
                        git,
                        left,
                        right
                    )

                    console.log(
                        MAGENTA,
                        `[${featureName}][${appName}][${left}...${right}] - ${nbCommitsBehind} commit(s) behind`
                    )

                    if (nbCommitsBehind > 0) {
                        const branchToUpdate: Branch = { left, right }

                        if (!branchesToUpdate?.[featureName]?.[appName]) {
                            // branches do not exists
                            branchesToUpdate = {
                                ...branchesToUpdate,
                                [featureName]: {
                                    [appName]: {
                                        workdir,
                                        branches: [branchToUpdate],
                                    },
                                },
                            }
                        } else {
                            // branches array already exists
                            branchesToUpdate?.[featureName]?.[
                                appName
                            ]?.branches?.push(branchToUpdate)
                        }
                    }
                } catch (e) {
                    console.error(
                        RED,
                        `[${featureName}][${appName}] - Comparing ${left} with ${right}`
                    )
                    console.error(e)
                }
            }
        }
    }

    return branchesToUpdate
}

async function getNbCommitsBehind(
    git: SimpleGit,
    originLeft: string,
    originRight: string
) {
    const revList = await git.raw([
        'rev-list',
        '--left-only',
        '--count',
        `${originLeft}...${originRight}`,
    ])

    const nbCommitsBehind = +revList.trim()
    return nbCommitsBehind
}

async function pullBranches(git: SimpleGit, left: string, right: string) {
    await git.checkout(left)
    await git.pull('origin', left)

    await git.checkout(right)
    await git.pull('origin', right)
}
