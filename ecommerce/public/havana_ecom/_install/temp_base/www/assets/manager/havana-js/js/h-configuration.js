H.config.redactor_page = {
	plugins: ['table', 'video', 'alignment', 'imagemanager'],
	formatting: ['p', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
	buttons: ['html','format', 'bold', 'italic', 'underline', 'lists', 'link', 'image', 'horizontalrule'],
	lang: 'it',
	linkTarget: true,
	maxHeight: '300px',
	minHeight: '300px',
	imageFloatMargin: '20px',
	imageResizable: true,
	imagePosition: true,
	imageManagerJson: '/manager/myarea/editor-image-list',
	imageUpload: '/manager/myarea/upload-editor-image',
	pastePlainText: true,
    imagePosition : {
		"left": "image-left",
		"right": "image-right",
		"center": "image-center"
    }

};
H.config.redactor = H.config.redactor_page;