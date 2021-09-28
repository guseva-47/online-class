class EmptyPropertyError extends Error {
  constructor(property) {
    const message = JSON.stringify({
      message: `Mandatory property is empty`,
      property: `${property}`,
    });
    super(message);
    this.name = EmptyPropertyError;
  }
}

module.exports = {
  EmptyPropertyError,
};
