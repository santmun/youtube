# Get Transcript

This API fetches transcript/subtitles from YouTube videos in various formats and languages.

## Example Request

`curl -X GET 'https://api.supadata.ai/v1/youtube/transcript?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&text=true' \-H 'x-api-key: YOUR_API_KEY'`

## Example Response

`{  "content": "Never gonna give you up, never gonna let you down...",  "lang": "en"}`

## Basics

### Endpoint

`GET https://api.supadata.ai/v1/youtube/transcript`

Each request requires an `x-api-key` header with your API key available after signing up:

`x-api-key: YOUR_API_KEY`

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| url | string | Yes* | YouTube video URL. Can be full URL or shortened (youtu.be) |
| videoId | string | Yes* | YouTube video ID. Alternative to URL |
| text | boolean | No | When true, returns plain text transcript. Default: false |
| chunkSize | number | No | Maximum characters per transcript chunk (only when text=false) |
- Either `url` or `videoId` must be provided

## Supported YouTube URL Formats

Supports various YouTube URL formats, eg:

`http://youtu.be/NLqAF9hrVbYhttps://youtube.com/shorts/xbGCdZ2Ei7ghttp://www.youtube.com/embed/NLqAF9hrVbYhttps://www.youtube.com/embed/NLqAF9hrVbYhttp://www.youtube.com/v/NLqAF9hrVbY?fs=1&hl=en_UShttp://www.youtube.com/watch?v=NLqAF9hrVbYhttp://www.youtube.com/ytscreeningroom?v=NRHVzbJVx8Ihttp://www.youtube.com/watch?v=JYArUl0TzhA&feature=featured`

Does not support:

- live videos
- user profile links
- playlists

## Response Format

**When `text=true`:**

`{  "content": string,  "lang": string    // ISO 639-1 language code}`

**When `text=false`:**

`{  "content": [    {      "text": string,      // Transcript segment      "offset": number,    // Start time in milliseconds      "duration": number,  // Duration in milliseconds      "lang": string      // ISO 639-1 language code of chunk    }  ],  "lang": string          // ISO 639-1 language code of transcript}`

## Error Codes

| Status | Code | Description |
| --- | --- | --- |
| 400 | `invalid-request` | Missing or invalid URL/videoId |
| 206 | `transcript-unavailable` | No transcript available for video |
| 401 | `unauthorized` | Invalid or missing API key |
| 400 | `error` | Generic error with message |