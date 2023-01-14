import repos from './data/repos.json'
import { SimpleGit, simpleGit } from 'simple-git'

// Change to true to debug
const debug = false

const MAGENTA = '\x1b[35m%s\x1b[0m'

async function main() {
    const features = Object.entries(repos)

    for await (const [featureName, feature] of features) {
        console.log(`Feature: ${featureName}`)

        const apps = Object.entries(feature)
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
                } catch (e) {
                    console.error(
                        `[${featureName}][${appName}] - Comparing ${left} with ${right}`
                    )
                    console.error(e)
                }
            }
        }
    }
}

main()

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
