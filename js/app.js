window.SQR = window.SQR || {}

SQR.reader = (() => {
    /**
     * getUserMedia()に非対応の場合は非対応の表示をする
     */
    const showUnsuportedScreen = () => {
        document.querySelector('#js-unsupported').classList.add('is-show')
    }
    if (!navigator.mediaDevices) {
        showUnsuportedScreen()
        return
    }

    const video = document.querySelector('#js-video')

    /**
     * videoの出力をCanvasに描画して画像化 jsQRを使用してQR解析
     */
    const checkQRUseLibrary = () => {
        const canvas = document.querySelector('#js-canvas')
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, canvas.width, canvas.height)

        if (code) {
            SQR.modal.open(code.data)
        } else {
            setTimeout(checkQRUseLibrary, 200)
        }
    }

    /**
     * videoの出力をBarcodeDetectorを使用してQR解析
     */
    const checkQRUseBarcodeDetector = () => {
        const barcodeDetector = new BarcodeDetector()
        barcodeDetector
            .detect(video)
            .then((barcodes) => {
                if (barcodes.length > 0) {
                    for (let barcode of barcodes) {
                        SQR.modal.open(barcode.rawValue)
                    }
                } else {
                    setTimeout(checkQRUseBarcodeDetector, 200)
                }
            })
            .catch(() => {
                console.error('Barcode Detection failed, boo.')
            })
    }

    /**
     * BarcodeDetector APIを使えるかどうかで処理を分岐
     */
    const findQR = () => {
        window.BarcodeDetector
            ? checkQRUseBarcodeDetector()
            : checkQRUseLibrary()
    }

    /**
     * デバイスのカメラを起動
     */
    const initCamera = () => {
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: {
                    facingMode: {
                        exact: 'environment',
                    },
                },
            })
            .then((stream) => {
                video.srcObject = stream
                video.onloadedmetadata = () => {
                    video.play()
                    findQR()
                }
            })
            .catch(() => {
                showUnsuportedScreen()
            })
    }

    return {
        initCamera,
        findQR,
    }
})()


SQR.modal = (() => {
    const result = document.querySelector('#js-result')
    const tanaban = document.querySelector('#tana')
    const link = document.querySelector('#js-link')
    const copyBtn = document.querySelector('#js-copy')
    const modal = document.querySelector('#js-modal')
    const modalClose = document.querySelector('#js-modal-close')

    alert('棚のQRコードを撮影してください')


    /**
     * 取得した文字列を入れ込んでモーダルを開く
     */
    const open = (url) => {
        result.value = url
        link.setAttribute('href', url)
        modal.classList.add('is-show')
    }

    // const tuika = ()=>{
    //     result.value = tanaban
    // }

    /**
     * モーダルを閉じてQR読み込みを再開
     */
    const close = () => {
        modal.classList.remove('is-show')
        SQR.reader.findQR()
    }

    const copyResultText = () => {
        result.select()
        document.execCommand('copy')
    }

    copyBtn.addEventListener('click', copyResultText)

    modalClose.addEventListener('click', () => close())

    return {
        open,
    }
})()

function append() {
    const result = document.querySelector('#js-result')
    let count =0;
    while(count<10){
      console.log(count);
      count++;
    // li要素を生成
    var li = document.createElement('li');
    // テキストノードを生成
    var text = document.createTextNode(result.value);
    // liタグの要素に、テキストノード textを追加
    li.appendChild(result);
    // idがlistsのulタグに、liを追加。具体的には<li>追加文字列</li>が、追加される。
    lists.appendChild(li);
}
}
  
  

if (SQR.reader) SQR.reader.initCamera()

