const axios = require('axios');
const inquirer = require('inquirer');

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
                'User-Agent': user,
                'Accept': 'application/vnd.github.v3+json'
            }
        })
        const openPRCount = response.data.filter(pullRequest => {
            return pullRequest.state;
        })
        console.log(`The repository ${repo} for user ${user} currently has ${openPRCount.length} open PRs`);
    } catch (error) {
        console.error(error);
    }
    
}

startApp();