import Models from '../models/index.js';

const { ProxyUrl } = Models;

// 파일 다운로드 함수
const downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user.id; // JWT 토큰에서 가져온 사용자 ID

        // 프록시 URL에서 만료되지 않은 파일을 찾음
        const proxyUrl = await ProxyUrl.findOne({
            where: {
                fileId: fileId,
                userId: userId, // 사용자 별 파일 접근 제어
                expiresAt: {
                    [Op.gt]: new Date(), // 만료되지 않은 프록시 URL
                }
            }
        });

        if (!proxyUrl) {
            return res.status(404).json({ code: 'FILE_NOT_FOUND', message: '해당 파일을 찾을 수 없습니다.' });
        }

        const filePath = path.join(__dirname, '..', 'uploads', proxyUrl.filePath);

        // 파일이 존재하는지 확인
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ code: 'FILE_NOT_FOUND', message: '해당 파일을 찾을 수 없습니다.' });
        }

        // 파일 전송
        return res.download(filePath, proxyUrl.originalFileName, (err) => {
            if (err) {
                return res.status(500).json({ code: 'DOWNLOAD_ERROR', message: '파일 다운로드 중 오류가 발생했습니다.' });
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: '서버 내부 오류가 발생했습니다.' });
    }
};


export default { 
    downloadFile 
};