{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  packages = [
    (pkgs.python312.withPackages (ps: with ps; [
      numpy
      pandas
      librosa
      soundfile
      matplotlib
      scipy
      jupyterlab
      parselmouth
      pydub
    ]))
  ];
}
