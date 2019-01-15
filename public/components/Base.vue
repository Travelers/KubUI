<script>
export default {
  methods: {
    handleError(error) {
      var message =
        this.getProp(error, ["response", "data", "message"]) || error.message;
      console.error("An error occurred: " + message);
      return message;
    },
    getProp(nestedObj, pathArr) {
      return pathArr.reduce(
        (obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : undefined),
        nestedObj
      );
    }
  }
};
</script>