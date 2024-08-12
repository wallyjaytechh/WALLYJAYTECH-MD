FROM quay.io/lyfe00011/md:beta
RUN git clone https://github.com/wallyjaytechh/WALLYJAYTECH-MD.git /root/WALLYJAYTECH-MD/
WORKDIR /root/WALLYJAYTECH-MD/
RUN yarn install
CMD ["npm", "start"]
