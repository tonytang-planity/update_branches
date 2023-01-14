import { Repos, ReposEntries } from 'types/repos'
import repos from './data/repos.json'

import { pullBranchesAndGetNbCommitsBehind } from './pullBranchesAndGetNbCommitsBehind'

// Change to true to debug
const debug = false

async function main() {
    const features = Object.entries(repos) as ReposEntries
    const branchesToUpdate = await pullBranchesAndGetNbCommitsBehind(
        features,
        debug
    )

    console.log({
        branchesToUpdate: JSON.stringify(branchesToUpdate, null, ' '),
    })
}

main()
