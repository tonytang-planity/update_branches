import { Entries, PartialDeep } from 'type-fest'
import { SimpleGit, simpleGit } from 'simple-git'
import { Branch } from 'types/branch'
import { Repos, ReposEntries } from 'types/repos'

const MAGENTA = '\x1b[35m%s\x1b[0m'
const RED = '\x1b[31m%s\x1b[0m'

export async function pullBranchesAndGetNbCommitsBehind(
    features: ReposEntries,
    debug: boolean
) {
    let branchesToUpdate: PartialDeep<Repos, { recurseIntoArrays: true }> = {}

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
