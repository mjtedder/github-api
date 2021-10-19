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
        promptUserToSelectPR(repo, user, openPullRequests);
        
    } catch (error) {
        console.error(error);
    }
}

async function getCommitsPerPullRequest(username, repository, data, prNumber) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${username}/${repository}/pulls/${prNumber}/commits`, {
            headers: {
                'Authorization': process.env.client_secret,
                'User-Agent': username,
                'Accept': 'application/vnd.github.v3+json'
            }
        })
        console.log(`The Pull Request #${prNumber} in repository ${repository} for user ${username} has ${response.data.length} commits`);   
    } catch (error) {
        console.error(error);
    }
}

function promptUserToSelectPR(repo, user, pullRequests) {
    //console.log(pullRequests)
    const prNumbers = pullRequests.map(pr => pr.number).sort((a,b) => a - b);
    console.log(prNumbers);
    inquirer.prompt(
        {
            type: 'list',
            name: 'details',
            message: 'Choose the Pull Request number you would like to view',
            choices: prNumbers
        }).then(answer => {
            getCommitsPerPullRequest(user, repo, pullRequests, answer.details);
        })
}

startApp();