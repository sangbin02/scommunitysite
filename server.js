const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// MongoDB에 연결 (MongoDB가 실행 중이어야 함)
mongoose.connect('mongodb://localhost:27017/messageboard', { useNewUrlParser: true, useUnifiedTopology: true });

// Message 모델 생성
const Message = mongoose.model('Message', {
    nickname: String,
    content: String,
    likes: Number,
    comments: [{ nickname: String, comment: String }]
});

// 모든 메시지를 가져오는 API 엔드포인트
app.get('/messages', async (req, res) => {
    const messages = await Message.find();
    res.json(messages);
});

// 새로운 메시지를 추가하는 API 엔드포인트
app.post('/messages', async (req, res) => {
    const { nickname, content, comments } = req.body;

    const newMessage = new Message({
        nickname,
        content,
        likes: 0,
        comments: comments || []
    });

    await newMessage.save();

    res.json(newMessage);
});

// 메시지에 댓글을 추가하는 API 엔드포인트
app.post('/messages/:id/comments', async (req, res) => {
    const { id } = req.params;
    const { commentNickname, comment } = req.body;

    const message = await Message.findById(id);
    if (!message) {
        return res.status(404).json({ error: '메시지를 찾을 수 없습니다' });
    }

    message.comments.push({ nickname: commentNickname, comment });
    await message.save();

    res.json(message);
});

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port}에서 실행 중입니다`);
});
