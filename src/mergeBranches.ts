import simpleGit, { MergeResult, SimpleGit } from 'simple-git'
import { Entries } from 'type-fest'
import { PartialRepos, ReposEntries } from 'types/repos'
import { MAGENTA, RED, CYAN } from './utils'
import inquirer from 'inquirer'

export async function mergeBranches(
    featuresToUpdate: PartialRepos
) {
    const features = Object.entries(featuresToUpdate) as ReposEntries

    let merges: { success: MergeResult[]; fail: MergeResult[] } = {
        success: [],
        fail: [],
    }
    for await (const [featureName, feature] of features) {
        console.log(`Feature: ${featureName}`)

        const apps = Object.entries(feature) as Entries<typeof feature>

        for await (const [appName, app] of apps) {
            console.log(`[${featureName}] - App: ${appName}`)

            const { branches, workdir } = app
            const git = simpleGit(workdir)

            for await (const { left, right } of branches) {
                try {
                    const name = `${featureName}-${appName}-${left}-${right}-merge`
                    const answer = await inquirer.prompt({
                        type: 'confirm',
                        name: name,
                        message: `[${featureName}][${appName}] - Merge ${left} into ${right} ?`,
                        default: false,
                    })
                    if (!answer[name]) {
                        console.log(
                            CYAN,
                            `[${featureName}][${appName}] - Not merging ${left} into ${right}`
                        )
                    } else {
                        console.log(
                            MAGENTA,
                            `[${featureName}][${appName}] - Merging ${left} into ${right}`
                        )
                        const mergeRes = await mergeBranch(git, left, right)
                        if (mergeRes.result !== 'success') {
                            // Should never happen because mergeBranch throws an error when
                            // it doesn't work
                            merges.fail.push(mergeRes)
                        } else {
                            await pushBranch(
                                featureName,
                                appName,
                                left,
                                right,
                                git
                            )
                        }
                    }
                } catch (e) {
                    console.error(
                        RED,
                        `[${featureName}][${appName}] - Merging ${left} with ${right} or pushing branch ${right} failed`
                    )
                    console.error(e)
                }
            }
        }
    }
}

async function pushBranch(
    featureName: string,
    appName: string,
    left: string,
    right: string,
    git: SimpleGit
) {
    const name = `${featureName}-${appName}-${left}-${right}-push`
    const answer = await inquirer.prompt({
        type: 'confirm',
        name: name,
        message: `[${featureName}][${appName}] - push branch ${right} ?`,
        default: false,
    })

    if (!answer[name]) {
        console.log(
            CYAN,
            `[${featureName}][${appName}] - skip push branch ${right}`
        )
    } else {
        await git.checkout(right)
        await git.push()

        console.log(
            CYAN,
            `[${featureName}][${appName}] - pushing branch ${right} done`
        )
    }
}

async function mergeBranch(git: SimpleGit, left: string, right: string) {
    await git.checkout(right)
    const mergeRes = await git.merge([left])

    return mergeRes
}
