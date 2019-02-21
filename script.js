const Peer = window.Peer;

(async function main() {
    const joinTrigger = document.getElementById('js-join-trigger');
    const roomId = document.getElementById('js-room-id');
    // canvas サイズ
    const canvas_w = 400;
    const canvas_h = 400;
    // マウス座標
    var mouse_x;
    var mouse_y;
    // API キー
    const skyway_key = '559b379c-14f9-4417-bc10-8c7f673e0173';
    const room_id = 'testroom01';

    const canvas = document.getElementById('cvs');
    canvas.width = canvas_w
    canvas.height = canvas_h
    const ctx = canvas.getContext('2d');


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
        room.on('data', ({ data, src }) => {
            // Show a message sent to the room and who sent
            console.log(data);
            var cd_raw = JSON.parse(data);
            var remote_x = cd_raw['x'];
            var remote_y = cd_raw['y'];
            var text = src;

            ctx.clearRect(0, 0, 400, 400);
            ctx.font = "italic 40px Arial";
            ctx.fillText(text, remote_x, remote_y);

        });

        canvas.onclick = function(e) {
            ctx.clearRect(0, 0, 400, 400);
            const rect = e.target.getBoundingClientRect();
            mouse_x = e.clientX - Math.floor(rect.left)
            mouse_y = e.clientY - Math.floor(rect.top)
    
            // 点の描画
            ctx.beginPath();
            ctx.arc(mouse_x, mouse_y, 5, 0, Math.PI * 2, false);
            ctx.fill();

            // 座標の送出
            var cd = JSON.stringify({
                'x': mouse_x,
                'y': mouse_y
            });
            room.send(cd);
        }
    });
    
    
})();