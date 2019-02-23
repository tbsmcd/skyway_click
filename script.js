const Peer = window.Peer;

(async function main() {
    const joinTrigger = document.getElementById('js-join-trigger');
    const roomId = document.getElementById('js-room-id');
    const myColorCode = document.getElementById('js-color-code');
    const wrapper = document.getElementById('cvs-wrapper');
    const clearPoint = document.getElementById('js-clear-point');
    // canvas サイズ
    const baseImage = document.getElementById('base-image');
    const canvas = document.getElementById('cvs');
    const canvas_w = baseImage.width;
    const canvas_h = baseImage.height;
    canvas.width = canvas_w;
    canvas.height = canvas_h;
    wrapper.setAttribute('style', 'width:' + canvas_w + ';height:' + canvas_h);
    
    // マウス座標
    var mouse_x;
    var mouse_y;
    // API キー
    const skyway_key = '559b379c-14f9-4417-bc10-8c7f673e0173';
    const ctx = canvas.getContext('2d');

    function addCvs(id) {
        const cvs = document.createElement('canvas');
        cvs.id = id;
        cvs.width = canvas_w;
        cvs.height = canvas_h;
        wrapper.insertBefore(cvs, baseImage.nextSibling);
    }

    // SkyWay の実装
    const peer = new Peer({
        key: skyway_key,
        debug: 3,
    });
    joinTrigger.addEventListener('click', () => {
        if (!peer.open) {
            return;
        }
        const room = peer.joinRoom(roomId.value, {
            mode: location.hash === '#sfu' ? 'sfu' : 'mesh'
        });
        // 現時点の自分以外のユーザ用の canvas を設置
        peer.listAllPeers(peers => {
            for (let v of peers) {
                if (v != peer.id && document.getElementById('cvs-' + v) == null) {
                    addCvs('cvs-' + v);
                }
            }
        });
        // 新規ユーザが入室した場合に canvas を追加
        room.on('peerJoin', peerId => {
            // canvas を追加する
            if (document.getElementById('cvs-' + peerId) == null) {
                addCvs('cvs-' + peer.id);
            }
        });
        // ユーザが退室した場合 canvas を削除
        room.on('peerLeave', peerId => {
            const remoteCvs = document.getElementById('cvs-' + peerId);
            remoteCvs.parentNode.removeChild(remoteCvs);
        });

        room.on('data', ({ data, src }) => {
            const cvsId = 'cvs-' + src
            const remoteCanvas = document.getElementById(cvsId);
            const remoteCtx = remoteCanvas.getContext('2d');
            remoteCtx.clearRect(0, 0, canvas_w, canvas_h);
            if (data['clear'] == false) {
                const remote_x = data['x'];
                const remote_y = data['y'];
                const remoteColor = data['color'];
                
                remoteCtx.beginPath();
                remoteCtx.fillStyle = remoteColor;
                remoteCtx.arc(remote_x, remote_y, 5, 0, Math.PI * 2, false);
                remoteCtx.fill();
            }
        });

        clearPoint.onclick = (e) => {
            ctx.clearRect(0, 0, canvas_w, canvas_h);
            room.send({'clear': true});
        }

        canvas.onclick = function(e) {
            ctx.clearRect(0, 0, canvas_w, canvas_h);
            const rect = e.target.getBoundingClientRect();
            mouse_x = e.clientX - Math.floor(rect.left);
            mouse_y = e.clientY - Math.floor(rect.top);

            console.log(mouse_x);
    
            // 点の描画
            ctx.beginPath();
            ctx.fillStyle = myColorCode.value;
            ctx.arc(mouse_x, mouse_y, 5, 0, Math.PI * 2, false);
            ctx.fill();

            // 座標の送出
            var cd = {
                'x': mouse_x,
                'y': mouse_y,
                'color': myColorCode.value,
                'clear': false
            };
            room.send(cd);
        }
    });
})();