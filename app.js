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
        retrieveGitHubData(answers.username, answers.repository);
    }).catch((err) => {
        console.error(err);
    })
}

function retrieveGitHubData(user, repo) {
    console.log(user, repo);
}

startApp();