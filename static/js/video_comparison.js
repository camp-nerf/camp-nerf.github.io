// Written by Dor Verbin, October 2021
// This is based on: http://thenewcode.com/364/Interactive-Before-and-After-Video-Comparison-in-HTML5-Canvas
// With additional modifications based on: https://jsfiddle.net/7sk5k4gp/13/
// Modified by Keunhong Park to be responsive to window size.


function playVids(containerElement) {
    let canvasElement = containerElement.find('canvas')[0]
    let videoElement = containerElement.find('video')[0]

    var position = 0.5;
    var context = canvasElement.getContext("2d");

    if (videoElement.readyState > 3) {
        // videoElement.play();

        function trackLocation(e) {
            // Normalize to [0, 1]
            bcr = canvasElement.getBoundingClientRect();
            position = ((e.pageX - bcr.x) / bcr.width);
        }
        function trackLocationTouch(e) {
            // Normalize to [0, 1]
            bcr = canvasElement.getBoundingClientRect();
            position = ((e.touches[0].pageX - bcr.x) / bcr.width);
        }

        canvasElement.addEventListener("mousemove", trackLocation, false);
        canvasElement.addEventListener("touchstart", trackLocationTouch, false);
        canvasElement.addEventListener("touchmove", trackLocationTouch, false);
        canvasElement.addEventListener("mouseout", function () { position = 0.5; }, false);


        function drawLoop() {
            if (videoElement.paused) {
                return;
            }
            const videoWidth = videoElement.videoWidth / 2;
            const videoHeight = videoElement.videoHeight;
            const canvasWidth = containerElement.width();
            const canvasHeight = canvasWidth * videoHeight / videoWidth;

            context.drawImage(videoElement, 0, 0, videoWidth, videoHeight, 0, 0, canvasWidth, canvasHeight);
            var colStart = (canvasWidth * position).clamp(0.0, canvasWidth);
            var colWidth = (canvasWidth - (canvasWidth * position)).clamp(0.0, canvasWidth);
            var sourceColStart = (videoWidth * position).clamp(0.0, videoWidth);
            var sourceColWidth = (videoWidth - (videoWidth * position)).clamp(0.0, videoWidth);
            context.drawImage(
                videoElement,
                sourceColStart + videoWidth, 0,
                sourceColWidth, videoHeight,
                colStart, 0,
                colWidth, canvasHeight);
            requestAnimationFrame(drawLoop);

            var arrowLength = 0.09 * canvasHeight;
            var arrowheadWidth = 0.025 * canvasHeight;
            var arrowheadLength = 0.04 * canvasHeight;
            var arrowPosY = canvasHeight / 10;
            var arrowWidth = 0.007 * canvasHeight;
            var currX = canvasWidth * position;

            // Draw circle
            context.arc(currX, arrowPosY, arrowLength * 0.7, 0, Math.PI * 2, false);
            context.fillStyle = "#FFD79340";
            context.fill()
            //mergeContext.strokeStyle = "#444444";
            //mergeContext.stroke()

            // Draw border
            context.beginPath();
            context.moveTo(canvasWidth * position, 0);
            context.lineTo(canvasWidth * position, canvasHeight);
            context.closePath()
            context.strokeStyle = "#AAAAAA";
            context.lineWidth = 5;
            context.stroke();

            // Draw arrow
            context.beginPath();
            context.moveTo(currX, arrowPosY - arrowWidth / 2);

            // Move right until meeting arrow head
            context.lineTo(currX + arrowLength / 2 - arrowheadLength / 2, arrowPosY - arrowWidth / 2);

            // Draw right arrow head
            context.lineTo(currX + arrowLength / 2 - arrowheadLength / 2, arrowPosY - arrowheadWidth / 2);
            context.lineTo(currX + arrowLength / 2, arrowPosY);
            context.lineTo(currX + arrowLength / 2 - arrowheadLength / 2, arrowPosY + arrowheadWidth / 2);
            context.lineTo(currX + arrowLength / 2 - arrowheadLength / 2, arrowPosY + arrowWidth / 2);

            // Go back to the left until meeting left arrow head
            context.lineTo(currX - arrowLength / 2 + arrowheadLength / 2, arrowPosY + arrowWidth / 2);

            // Draw left arrow head
            context.lineTo(currX - arrowLength / 2 + arrowheadLength / 2, arrowPosY + arrowheadWidth / 2);
            context.lineTo(currX - arrowLength / 2, arrowPosY);
            context.lineTo(currX - arrowLength / 2 + arrowheadLength / 2, arrowPosY - arrowheadWidth / 2);
            context.lineTo(currX - arrowLength / 2 + arrowheadLength / 2, arrowPosY);

            context.lineTo(currX - arrowLength / 2 + arrowheadLength / 2, arrowPosY - arrowWidth / 2);
            context.lineTo(currX, arrowPosY - arrowWidth / 2);

            context.closePath();

            context.fillStyle = "#AAAAAA";
            context.fill();

            context.font = "20px 'Google Sans', sans-serif";
            context.fillStyle = "white";
            context.strokeStyle = 'black';
            context.lineWidth = 2;
            context.textAlign = "left";
            context.textBaseline = "bottom";
            context.strokeText('SCNeRF', 10, canvasHeight - 5)
            context.fillText('SCNeRF', 10, canvasHeight - 5);

            context.textAlign = "right";
            context.strokeText('SCNeRF+CamP', canvasWidth - 10, canvasHeight - 5)
            context.fillText('SCNeRF+CamP', canvasWidth - 10, canvasHeight - 5);
        }
        requestAnimationFrame(drawLoop);
    }
}

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};


function resizeAndPlay(containerElement) {
    let canvasElement = containerElement.find('canvas')[0]
    let videoElement = containerElement.find('video')[0]
    const videoWidth = videoElement.videoWidth / 2;
    const videoHeight = videoElement.videoHeight;
    const canvasWidth = containerElement.width();
    const canvasHeight = canvasWidth * videoHeight / videoWidth;
    canvasElement.width = canvasWidth;
    canvasElement.height = canvasHeight;
    videoElement.play();
    videoElement.style.height = "0px";  // Hide video without stopping it
    videoElement.playbackRate = 0.5;

    playVids(containerElement);

    $(window).on('resize', function (e) {
        const canvasWidth = containerElement.width();
        const canvasHeight = canvasWidth * videoHeight / videoWidth;
        canvasElement.width = canvasWidth;
        canvasElement.height = canvasHeight;
    });
}

$(document).ready(function () {
    $('.video-comparison').each(function () {
        const containerElement = $(this);
        let videoElement = containerElement.find('video');
        videoElement.on('play', function () { resizeAndPlay(containerElement); });
    });
})
