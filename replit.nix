{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.ffmpeg
    pkgs.imagemagick
    pkgs.git
    pkgs.python3
    pkgs.pkg-config
    pkgs.libwebp
    pkgs.libuuid
  ];
}
