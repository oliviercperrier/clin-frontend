const FileDownload = (data: Blob, fileName: string) => {
  const downloadLinkElement = window.document.createElement('a');
  downloadLinkElement.href = window.URL.createObjectURL(data);
  downloadLinkElement.download = fileName;
  document.body.appendChild(downloadLinkElement);
  downloadLinkElement.click();
  document.body.removeChild(downloadLinkElement);
}

export default FileDownload;