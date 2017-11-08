$('.ui.dropdown').dropdown();
$('.ui.form').form({
    fields: {
        name: {
            identifier: 'name',
            rules: [{
                type: 'empty',
                prompt: 'Please enter your name'
            }]
        },
        location: {
            identifier: 'location',
            rules: [{
                type: 'empty',
                prompt: 'Please select a location'
            }]
        },
        content: {
            identifier: 'content',
            rules: [{
                type: 'empty',
                prompt: 'Please enter your content'
            }]
        }
    }
});