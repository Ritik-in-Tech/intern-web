export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  `http://localhost:${process.env.REACT_APP_API_PORT}/api/v1`;

// src/config/iconConfig.ts

import redInactive from "../assets/icons/red_inactive.svg";
import redActive from "../assets/icons/red_active.svg";
import blueInactive from "../assets/icons/blue_inactive.svg";
import blueActive from "../assets/icons/blue_active.svg";
import yellowInactive from "../assets/icons/yellow_inactive.svg";
import yellowActive from "../assets/icons/yellow_active.svg";
import orangeInactive from "../assets/icons/orange_inactive.svg";
import orangeActive from "../assets/icons/orange_active.svg";
import greenInactive from "../assets/icons/green_inactive.svg";
import greenActive from "../assets/icons/green_active.svg";

export const svgIcons = {
  red: { inactive: redInactive, active: redActive },
  orange: { inactive: orangeInactive, active: orangeActive },
  yellow: { inactive: yellowInactive, active: yellowActive },
  blue: { inactive: blueInactive, active: blueActive },
  green: { inactive: greenInactive, active: greenActive },
};

export const contactNumberRegex = /^\d{10,11}$/;
export const emailRegex =
  /^[A-Za-z0-9]{1}[A-Za-z0-9_.+-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/;

export const CLIENT_LOGIN_URL = "/";
export const ADMIN_LOGIN_URL = "/admin/login";

// export const AWS_S3_BUCKET_NAME = "ugoki-bucket";
export const AWS_S3_BUCKET_NAME = process.env.REACT_APP_AWS_S3_BUCKET_NAME;

