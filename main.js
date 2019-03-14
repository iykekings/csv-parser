/** @namespace csvReader */
class csvReader {
  file = '';
  /**
   * @param {(String|File)} file
   */
  constructor(file) {
    this.file = file;
  }

  /**Reads a csv file - whose url was used to directly initialise the constructor
   * readExternal()
   * @instance
   * @returns {Promise} A Promise object { columns, content, headers, rows } of the csv file
   *  @example
   * // returns {columns: 236, content: Array(236), headers: Array(5), rows: 5}
   * csvReader.readExternal();
   */
  readExternal() {
    return new Promise((resolve, reject) => {
      try {
        fetch(this.file)
          .then(val => val.text())
          .then(text => {
            let exFile = new File([`${text}`], 'well log');
            const reader = new FileReader();
            reader.readAsText(exFile);
            reader.onload = event => {
              let res = event.target.result
                .split('\r\n')
                .map(single => single.split(','));
              const { columns, content, headers, rows } = this.getFileProps(
                res
              );
              resolve({ columns, content, headers, rows });
            };
            reader.onerror = event => {
              const error = event.target.error;
              reject(error);
            };
          });
      } catch (error) {
        throw new Error(
          'Parameter should be an instance of File or a valid file url'
        );
      }
    });
  }

  getFileProps(res) {
    const headers = res.shift();
    const content = getContent();
    function getContent() {
      let collated = [];
      for (let i = 0; i < res.length; i++) {
        let singleObj = {};
        for (let j = 0; j < headers.length; j++) {
          singleObj[headers[j]] = res[i][j];
        }
        const len = Object.values(singleObj).filter(val => Boolean(val)).length;
        if (len > 0) {
          collated.push(singleObj);
        }
      }
      return collated;
    }
    let rows = content.length;
    let columns = headers.length;
    return { columns, content, headers, rows };
  }

  /**Reads a csv file already initialised to File type - used to read from HTMLInput Element type=['file']
   * @returns {Promise} A Promise object { columns, content, headers, rows } of the csv file
   */
  read() {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(this.file);
      reader.onload = event => {
        let res = event.target.result
          .split('\r\n')
          .map(single => single.split(','));
        const { columns, content, headers, rows } = this.getFileProps(res);
        resolve({ columns, content, headers, rows });
      };
      reader.onerror = event => {
        const error = event.target.error;
        reject(error);
      };
    });
  }
}

const file = document.querySelector('#file-input');
file.addEventListener('change', e => {
  const file = e.target.files[0];
  let myCsv = new csvReader(file);
  myCsv
    .read()
    .then(val => console.log(val))
    .catch(err => console.log(err));
});

const testFile = new csvReader('well.csv');
testFile
  .readExternal()
  .then(val => console.log(val))
  .catch(err => console.log(err));
