// Set up authentication
const accessToken = 'ACCESS-TOKEN';
const headers = {
    Authorization: `Bearer ${accessToken}`,
};

// Define repository information
const owner = 'mo-rieger';
const repo = 'foambubble-highlights';
const branch = 'master';

async function commit(selection, host, path, tags) {
    // use host as tag if no tags are provided
    if (tags.length === 0) {
        let hostPortions = host.split('/');
        if (hostPortions.length > 1) {
            tags.push(hostPortions[1])
        }
    }

    let pathPortions = path.split('/');
    let topic = pathPortions[pathPortions.length - 1]
    const filePath = `web/${host}/${topic}.md`;
    // Check if the file exists
    const fileEndpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    let existingContent = '';
    let appendContent = `#${tags.join(" #")}\n${selection.toString()}`;

    fetch(fileEndpoint, { headers })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Error occurred while checking file existence');
        })
        .then((fileData) => {
            existingContent = atob(fileData.content);

    // Append new content to the existing content or create new content if the file doesn't exist
            const newContent = existingContent + `\n\n${appendContent}`;

    // Encode the updated content to Base64
            const encodedContent = btoa(newContent);

            // Update the existing file with the appended content
            const updateFileEndpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

            return fetch(updateFileEndpoint, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    message: 'Append content to file',
                    content: encodedContent,
                    branch: branch,
                    sha: fileData.sha,
                }),
            });
        })
        .catch((error) => {
            if (error.message === 'Error occurred while checking file existence') {
                // File doesn't exist, create a new file with the appended content
                const newContent = `# [${topic}](${host}/${path})\n\n${appendContent}`;

                // Encode the new content to Base64
                const encodedContent = btoa(newContent);

                const createFileEndpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
                const payload = {
                    message: 'Create new file',
                    content: encodedContent,
                    branch: branch,
                };

                return fetch(createFileEndpoint, {
                    method: 'PUT',
                    headers: headers,
                    body: JSON.stringify(payload),
                });
            }
            throw error;
        })
        .then((response) => {
            if (response.ok) {
                if (existingContent === '') {
                    console.log('New file created with the appended content.');
                } else {
                    console.log('Existing file updated with the appended content.');
                }
            } else {
                throw new Error('Error occurred while updating file');
            }
        })
        .catch((error) => {
            console.error('Error:', error.message);
        });
}

export { commit }