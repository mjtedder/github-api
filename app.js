const axios = require('axios');
const inquirer = require('inquirer');
require('dotenv').config();

const dataObject = {
    user: '',
    repo: '',
    prData: [],
    commitData: []
}

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
        dataObject.user = answers.username;
        dataObject.repo = answers.repository;
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
        if (openPullRequests.length) {
            dataObject.prData = openPullRequests;
            console.log(`The repository ${repo} for user ${user} currently has ${openPullRequests.length} open PRs`);
            promptUserToSelectPR();
        } else {
            console.log(`The repository ${repo} does not currently have any open PRs.`)
            startApp();
        }    
    } catch (error) {
        console.error(error);
    }
}

async function getCommitsPerPullRequest(prNumber) {
    const { user, repo } = dataObject;
    try {
        const response = await axios.get(`https://api.github.com/repos/${user}/${repo}/pulls/${prNumber}/commits`, {
            headers: {
                'Authorization': process.env.client_secret,
                'User-Agent': user,
                'Accept': 'application/vnd.github.v3+json'
            }
        })
        dataObject.commitData = response.data;
        console.log(`The Pull Request #${prNumber} in repository ${repo} for user ${user} has ${response.data.length} commits`);   
    } catch (error) {
        console.error(error);
    }
}

function promptUserToSelectPR() {
    const { prData } = dataObject;
    const prNumbers = prData.map(pr => pr.number).sort((a,b) => a - b);
    console.log(prNumbers);
    inquirer.prompt(
        {
            type: 'list',
            name: 'details',
            message: 'Choose the Pull Request number you would like to view',
            choices: prNumbers
        }).then(answer => {
            getCommitsPerPullRequest(answer.details);
        })
}

startApp();