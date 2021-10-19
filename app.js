const axios = require('axios');
const inquirer = require('inquirer');
require('dotenv').config();

function startApp() {
    const questions = [
        {
            type: 'input',
            name: 'username',
            message: 'Please input the GitHub username you would like to query'
        },
        {
            type: 'input',
            name: 'repository',
            message: 'Please input the GitHub repository you would like to query'
        }
    ]
    inquirer.prompt(questions)
    .then((answers) => {
        getOpenPullRequestData(answers.username, answers.repository);
    }).catch((err) => {
        console.error(err);
    })
}

async function getOpenPullRequestData(user, repo) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${user}/${repo}/pulls`, {
            headers: {
                'Authorization': process.env.client_secret,
                'User-Agent': user,
                'Accept': 'application/vnd.github.v3+json'
            }
        })
        const openPullRequests = response.data.filter(pullRequest => {
            return pullRequest.state;
        })
        console.log(`The repository ${repo} for user ${user} currently has ${openPullRequests.length} open PRs`);
        getCommitsPerPullRequest(user, repo, openPullRequests);
    } catch (error) {
        console.error(error);
    }
}

function getCommitsPerPullRequest(username, repository, data) {
    let returnedCommits = [];
    let promises = [];
    data.forEach(pullRequest => {
        promises.push(
            axios.get(`https://api.github.com/repos/${username}/${repository}/pulls/${pullRequest.number}/commits`, {
                headers: {
                    'Authorization': process.env.client_secret,
                    'User-Agent': username,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }).then(response => {
                returnedCommits.push(response.data)
            })
        )
    })
    Promise.all(promises).then(() => console.log(returnedCommits))
}

startApp();