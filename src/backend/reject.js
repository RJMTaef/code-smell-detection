const vscode = acquireVsCodeApi();

document.addEventListener("DOMContentLoaded", () => {
    // Add event listener to the "Reject Changes" button
    const rejectButton = document.getElementById("decline");
    rejectButton.addEventListener("click", () => {
        rejectSuggestion();
        vscode.postMessage({ command: "rejectRefactoringSuggestion" });
    });
});

function rejectSuggestion() {
    // Clear the HTML content
    document.body.innerHTML = `
        <h1 style="color: red; text-align: center; margin-top: 30%;">This suggestion has been rejected.</h1>
        <p style="text-align: center;">Close this window or select another smell</p>
    `;
}
