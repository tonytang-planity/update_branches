import { Entries } from 'type-fest'
import { SimpleGit, simpleGit } from 'simple-git'
import { Branch } from 'types/branch'
import { PartialRepos, ReposEntries } from 'types/repos'
import { MAGENTA, RED } from './utils'

export async function pullBranchesAndGetNbCommitsBehind(
    features: ReposEntries,
    debug: boolean
): Promise<PartialRepos> {
    let branchesToUpdate: PartialRepos = {}

    for await (const [featureName, feature] of features) {
        console.log(`Feature: ${featureName}`)

        const apps = Object.entries(feature) as Entries<typeof feature>

        for await (const [appName, app] of apps) {
            console.log(`[${featureName}] - App: ${appName}`)

            const { branches, workdir } = app
            const git = simpleGit(workdir)

            // save curernt branch name
            const currentBranch = await git.branchLocal()
            console.log(`current branch : ${currentBranch.current}`)

            // check if need to stash
            const status = await git.status()
            const needToStash = status.files.length > 0
            if (needToStash) {
                console.log(
                    `Stashing changes on branch ${currentBranch.current}`
                )
                await git.stash()
            }

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
                } catch (e) {
                    console.error(
                        RED,
                        `[${featureName}][${appName}] - Comparing ${left} with ${right}`
                    )
                    console.error(e)
                } finally {
                    // Go back to the current branch
                    console.log(
                        `Switching back to branch : ${currentBranch.current}`
                    )
                    await git.checkout(currentBranch.current)

                    // Unstash changes if needed
                    if (needToStash) {
                        console.log(`Unstashing changes`)
                        await git.stash(['pop'])
                    }

                    console.log('\n')
                }
            }
        }
    }
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
