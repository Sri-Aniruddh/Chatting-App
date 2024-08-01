import axios from "axios";
import { HOST } from "@/Utils/constent";

export const apiClient=axios.create({
    baseURl:HOST,
});
