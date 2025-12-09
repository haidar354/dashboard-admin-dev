import dayjs from "dayjs";
import { defineStore } from "pinia";

export const useUtilStore = defineStore("utilStore", {
  state: () => ({
    year: dayjs().format("YYYY") as string,
  }),
});
