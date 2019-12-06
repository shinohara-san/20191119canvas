'use strict';

window.addEventListener('load', () => {
  //初期化
  let isDraw = false;             //スイッチ：true=線を引く, false=線は引かない
  let txy = 0;                    //描画位置の調整，iPadなどは15＋すると良いかも
  let oldX = 0;                   //１つ前の座標を代入するための変数
  let oldY = 0;                   //１つ前の座標を代入するための変数
  let bold_line = 3;              //ラインの太さ
  let currentColor = '#000';             //ラインの色
  let alpha = 1;                  //ラインの透明度

  // キャンバスの準備
  const canvas = $('#drowarea')[0];
  const context = canvas.getContext('2d');

  //MouseDownイベント：フラグをTrue(クリック状態のときだけ線を書きたいため)
  $(canvas).on('mousedown', function (e) {
    // console.log(e);
    // 座標を取得して描画状態にする処理を記述
    oldX = e.offsetX;
    oldY = e.offsetY - txy;
    isDraw = true;
  });

  //MouseMove：動かしてラインを引く処理
  $(canvas).on('mousemove', function (e) {
    //  【注意】mousedownはクリックしていてもいなくても発火するので条件分岐する必要あり！

    if (isDraw) {
      context.strokeStyle = currentColor;    //色
      context.lineWidth = bold_line;  //太さ
      context.globalAlpha = alpha;    //透明度
      context.lineJoin = 'round';     //線の接続部
      context.lineCap = 'round';      //線の端の形

      // 線を引く処理を記述
      context.beginPath();
      context.moveTo(oldX, oldY);
      context.lineTo(e.offsetX, e.offsetY - txy);
      context.stroke();
      // 一つ前の座標に現在の座標を保存する処理を記述
      oldX = e.offsetX;
      oldY = e.offsetY - txy;
    }
  });

  //MouseUpフラグをfalse
  $(canvas).on('mouseup', function (e) {
    // 描かなくする処理
    isDraw = false;
    // console.log('ok');
  });

  //カーソルがキャンバスから外れると描画を中止する処理
  $(canvas).on('mouseout', function (e) {
    // 描かなくする処理
    isDraw = false;
  });

  //線の太さスケール(線の太さを変更する処理)
  $('#bold').on('change', function (e) {
    console.log('太さ変更！');
    // 太さを設定する処理
    bold_line = $('#bold').val();

  });

  //透明度スケール(線の透明度を変更する処理)
  $('#alpha').on('change', function (e) {
    console.log('透明度を変更！');
    // 透明度を設定する処理
    alpha = $('#alpha').val();
  });
  $('#bg_color').on('change', function () {
    console.log('背景色を変更！');
    $(canvas).css('background', $(this).find('option:selected').get(0).style.color);
  });



  //カラーボタン(線の色を変更する処理)
  // $('#color').on('change', function (e) {
  //   console.log('色変更！');
  //   // 色を設定する処理
  //   currentColor = $('#color').val();

  // });

  //ペン(線を書く状態にする処理，デフォルトでは線を書く状態)
  $('#pen').on('click', function (e) {
    console.log('ペンモードです！');
    // ペンの状態にする処理
    context.globalCompositeOperation = 'source-over';
  });

  //消しゴム(書いた線を消去する状態にする処理)
  $('#erase').on('click', function (e) {
    console.log('消しゴムモードです！');
    // 消しゴムの状態にする処理
    context.globalCompositeOperation = "destination-out";
  });



  //クリアボタン(キャンバスの内容を消去)
  $('#clear_btn').on('click', function (e) {
    console.log('クリア！');
    // 消去する処理を記述
    context.clearRect(0, 0, canvas.width, canvas.height);
  });

  // スタックしておく最大回数。キャンバスの大きさの都合などに合わせて調整したら良いです。
  const STACK_MAX_SIZE = 5;
  // スタックデータ保存用の配列
  let undoDataStack = [];
  let redoDataStack = [];
  // 画像保存
  $(canvas).on('mousedown', function () {
    if (undoDataStack.length > STACK_MAX_SIZE) {
      undoDataStack.pop();
    }
    undoDataStack.unshift(context.getImageData(0, 0, canvas.width, canvas.height));
    // console.log(undoDataStack);
  });

  function undo() {
    if (undoDataStack.length <= 0) return;
    redoDataStack.unshift(context.getImageData(0, 0, canvas.width, canvas.height));
    var imageData = undoDataStack.shift();
    context.putImageData(imageData, 0, 0);
  }

  function redo() {
    if (redoDataStack.length <= 0) return;
    undoDataStack.unshift(context.getImageData(0, 0, canvas.width, canvas.height));
    var imageData = redoDataStack.shift();
    context.putImageData(imageData, 0, 0);
  }

  $('#back').on('click', function () {
    undo();
  });

  $('#forth').on('click', function () {
    redo();
  });

  $('#save').click(function () {
    var img = $('<img>').attr({
      width: 150,
      height: 150,
      src: canvas.toDataURL()
    });
    var link = $('<a>').attr({
      href: canvas.toDataURL().replace('image/png', 'application/octet-stream'),
      download: new Date().getTime() + '.png'
    });
    $('#gallery').append(link.append(img.addClass('thumbnail')));
    context.clearRect(0, 0, canvas.width, canvas.height);
  });

  function initColorPalette() {
    const joe = colorjoe.rgb('color-palette', currentColor);

    // 'done'イベントは、カラーパレットから色を選択した時に呼ばれるイベント
    // ドキュメント: https://github.com/bebraw/colorjoe#event-handling
    joe.on('done', color => {

      // コールバック関数の引数からcolorオブジェクトを受け取り、
      // このcolorオブジェクト経由で選択した色情報を取得する

      // color.hex()を実行すると '#FF0000' のような形式で色情報を16進数の形式で受け取れる
      // draw関数の手前で定義されている、線の色を保持する変数に代入して色情報を変更する
      currentColor = color.hex();
    });
  }

  initColorPalette();

  
  var file = document.getElementById('file');
  var canvasWidth = 500;
  var canvasHeight = 500;
  var uploadImgSrc;

  // Canvasの準備
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  function loadLocalImage(e) {
    // ファイル情報を取得
    // console.log(e);
    var fileData = e.target.files[0];

    // 画像ファイル以外は処理を止める
    if (!fileData.type.match('image.*')) {
      alert('画像を選択してください');
      return;
    }

    // FileReaderオブジェクトを使ってファイル読み込み
    var reader = new FileReader();
    // ファイル読み込みに成功したときの処理
    reader.onload = function () {
      // Canvas上に表示する
      uploadImgSrc = reader.result;
      canvasDraw();
    }
    // ファイル読み込みを実行
    reader.readAsDataURL(fileData);
  }

  // ファイルが指定された時にloadLocalImage()を実行
  file.addEventListener('change', loadLocalImage, false);

  // Canvas上に画像を表示する
  function canvasDraw() {
    // canvas内の要素をクリアする
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Canvas上に画像を表示
    var img = new Image();
    img.src = uploadImgSrc;
    img.onload = function () {
      context.drawImage(img, 0, 0, canvasWidth, this.height * (canvasWidth / this.width));
    }
  }

  var imgd = context.getImageData(0, 0, 500, 300);
  var pix = imgd.data;
  for (var i = 0, n = pix.length; i < n; i += 4) {
    var grayscale = pix[i] * .3 + pix[i + 1] * .59 + pix[i + 2] * .11;
    pix[i] = grayscale; // red
    pix[i + 1] = grayscale; // green
    pix[i + 2] = grayscale; // blue
    // alpha
  }
  context.putImageData(imgd, 0, 0);


  $('#grayScale').on('click', function() {
    // Canvasから描画内容を保持するimageDataを取得する。

    var getImage = context.getImageData(0, 0, canvas.width, canvas.height);

    // 描画内容に対して、上記のグレースケールにする式を当てはめながら
    // rgbの値を計算する。
    var d = getImage.data;
    for (var i = 0; i < d.length; i += 4) {
      var g = d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722;
      d[i] = d[i + 1] = d[i + 2] = g;
      // d[i+3]に格納されたα値は変更しない
    }

    // 計算結果でCanvasの表示内容を更新する。
    context.putImageData(getImage, 0, 0);
  });
});
