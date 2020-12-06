# Luciano Mammino - 2020-12-06

A simple Next.js application to manage file uploads to a folder.

## Installation

This is a next.js application. To run it locally you have to first install all the project dependencies with `yarn install`, then you can run it in dev mode with `yarn dev`.

The app will start at http://localhost:3000/

You can also run the the test suite (lint and unit tests) with `yarn test`


## Security

- This application does NOT provide any authentication/authorization mechanism
- This application does NOT provide any other mechanism (e.g. CSRF) to prevent malicious bodies to retrieve the list of files directly (`curl http://localhost:3000/api/fs/ls | jq .` will show all the available files). Of course, this doesn't make the app ready to be shipped to a remote server
- The application validates file uploads (max file size / file type) on both frontend and backend
- On the backend, the upload is carried over only if files are valid. Data is initially stored in a temp folder and only moved to the final destination if all the validation rules pass. Mime type validation is done as soon as the file is started to be uploaded, while file size is checked in a streaming fashion: as soon as the stream goes over the maximum expected size, the stream is interrupted.
- The frontend application does not set HTML dynamically (Normal react data binding should take care of most sanitization needs)
- During the upload, the original file name is used to compute the actual destination name in the final data folder. The storage is kept flat. In order to avoid attempts to escape the final destination folder, every `/` or `\` in the original file name are replaced to `_`
- If a file already exists with a given name, the final file is given a random suffix to avoid overriding the original file.


## Improvements

Some potential improvements that are currently missing:

  - Some dialogs (errors, confirm messages) have been implemented using `alert` and `confirm`. This is not ideal for many reasons (bad UI/UX, blocking the event loop, etc.), so with more time I would have used dedicated react components to handle these interactions (e.g. a toast component like [`react-toast-notifications`](https://jossmac.github.io/react-toast-notifications/)).
  - With more time I would have added some sort of Authentication mechanism or at least some CSRF mechanism to make the backend API more secure.
  - Backend tests are missing
  - E2E tests are missing (something like Cypress might have been nice here)
  - For simplicity of implementation, the UI will always have a partial view of the content of the data folder. It is loaded at startup and then kept in sync while the various delete or upload operations happen. If files are added or deleted manually (or from another UI) these changes won't be immediately reflected in the UI. It could have been nice to explore a different architecture using websockets to keep the UI always in sync. A simpler alternative (not implemented here), could be to poll the API layer to retrieve the list of files at given intervals of time rather than doing it only once at startup time.


## Libraries

  "formidable": "^1.2.2",
    "next": "10.0.3",
    "pretty-bytes": "^5.4.1",
    "prop-types": "^15.7.2",

  - [`next`](https://npm.im/next): Next.js, to quickly scaffold a React application with backend APIs.
  - [`prop-types`](https://npm.im/prop-types): To validate props being passed to components.
  - [`pretty-bytes`](https://npm.im/pretty-bytes): To easily convert byte units into more readable strings (e.g. `1000 -> 1 kb` ).
  - [`formidable`](https://npm.im/formidable): To handle multipart form submissions in a streaming way on the backend.
  - [`eslint`](https://npm.im/eslint): To make sure coding style is consistent (using [StandardJS style](https://standardjs.com/)) and to spot common JavaScript mistakes.


## API

**Note**: the API will manage files in the `data` folder (upload, delete, list operations). The file system is effectively used as a poor man's database from the API layer.

The API layout is not particularly RESTful. I could have used some more advanced capabilities of Next.js to have more freedom on how to structure the API, but I went for speed rather than for compliance with the common RESTful conventions.


### GET /api/fs/ls

Lists all the files available in the `data` folder.

#### Example

```bash
curl http://localhost:3000/api/fs/ls | jq .
```

##### 200 OK

```json
{
  "files": [
    {
      "name": "1999229.png",
      "size": 43090
    },
    {
      "name": "457cc040ca23e98d84f70d215111255c copy.jpg",
      "size": 11572
    },
    {
      "name": "9b822e70053cb1f65dfd7a99fcd6d98a-best-quality-badge-by-vexels copy.png",
      "size": 28655
    }
  ]
}  
```

### DELETE /api/fs/delete/:filename

Deletes a file from the filesystem

#### Input

 - `filename` (path parameter): the name of the file to delete (e.g. `1999229.png`)

#### Example

```bash
curl http://localhost:3000/api/fs/delete/1999229.png | jq .
```

##### 200 OK

```json
{
  "success": true,
  "deleted": "1999229.png"
}
```


### POST /api/fs/upload

Uploads a new file to the file system

#### Input

 - `file` (body parameter): A file attachment using `multipart/form-data` for encoding

#### Example

```bash
curl --form file='@filename.jpg' http://localhost:3000/api/fs/upload | jq .
```

##### 201 CREATED

```json
{
  "name": "filename.jpg",
  "size": 13234444
}
```