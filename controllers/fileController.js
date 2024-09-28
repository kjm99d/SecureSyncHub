import Models from '../models/index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const { ProxyUrl, File } = Models;

// 파일 다운로드 함수
// 파일 다운로드 함수
const downloadFile = async (req, res) => {
    try {
        const proxyKey = req.params.proxyKey;

        // 프록시 URL에서 만료되지 않은 파일을 찾음
        const proxyUrl = await ProxyUrl.findOne({
            where: {
                url: proxyKey   // 프록시 KEY 정보
            }
        });

        if (!proxyUrl) {
            return res.status(404).json({ code: 'FILE_NOT_FOUND', message: '해당 파일을 찾을 수 없습니다.' });
        }

        // 파일 ID로 Files 테이블에서 파일 정보를 조회
        const file = await File.findOne({
            where: {
                id: proxyUrl.fileId
            }
        });

        if (!file) {
            return res.status(404).json({ code: 'FILE_NOT_FOUND', message: '해당 파일을 찾을 수 없습니다.' });
        }

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const filePath = path.join(__dirname, '..', file.filePath);

        // 파일이 존재하는지 확인
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ code: 'FILE_NOT_FOUND', message: '해당 파일을 찾을 수 없습니다.' });
        }

        // 파일 전송
        return res.download(filePath, file.originalFileName, (err) => {
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