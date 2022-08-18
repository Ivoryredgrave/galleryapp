import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet";
import { hostname, port } from "./local";
import { Card, Button, Typography, Divider, message, Space } from "antd";

function App() {
  const { Title } = Typography;
  const { Text } = Typography;
  let [file, setFile] = useState(null);
  const validImageTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/jpg'];
  const [imageslists, setimagelist] = useState([]);
  const [listupdate, setlistupdate] = useState(false);
  const [modalopen, setmodalopen] = useState(false);
  const [cureeImg, setcureeImg] = useState(null);

  useEffect(() => {
    Modal.setAppElement("body");

    fetch(`http://${hostname}:${port}/api/imagenes/get`)
      .then((res) => res.json())
      .then((res) => setimagelist(res))
      .catch((error) => {
        message.error("Error obteniendo las imágenes");
        console.log(error);
      });
    setlistupdate(false);
  }, [listupdate]);

  const selectedHandler = (e) => {
    setFile(e.target.files[0]);
  };

  const sendHandler = (event) => {

    if (!file) {
      message.warning("Selecciona una imagen");
      return false;
    } else if (file.size > 2097152) {
      message.warning("¡La imagen debe tener menos de 2 MB!");
      return false;
    } else if (!validImageTypes.includes(file.type)) {
      message.warning("Solo se permiten imágenes de tipo .png .jpeg .gif");
      return false;
    } else {
      const formdata = new FormData();
      formdata.append("image", file);

      fetch(`http://${hostname}:${port}/api/imagenes/post`, {
        method: "POST",
        body: formdata,
      })
        .then((res) => res.text())
        .then((res) => {
          setlistupdate(true);
        })
        .catch((error) => {
          console.log(error);
        });

      document.getElementById("fileinput").value = null;

      setFile(null);
    }
  };

  const hanleModal = (isOpen, image) => {
    setmodalopen(isOpen);
    setcureeImg(image);
  };

  const deletehanle = () => {
    Swal.fire({
      title: "¿Estas seguro?",
      text: "La imagen se eliminará",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Borrar",
    }).then((result) => {
      if (result.isConfirmed) {
        let imageID = cureeImg.split(" ");
        imageID = parseInt(imageID[0]);
        fetch(`http://${hostname}:${port}/api/imagenes/delete/` + imageID, {
          method: "DELETE",
        })
          .then((res) => res.text())
          .then((res) => console.log(res));
        setmodalopen(false);
        setlistupdate(true);
        Swal.fire("Imagen eliminada!", "La imagen ha sido borrada", "success");
      }
    });
  };

  return (
    <div>

      <Helmet>
        <title>GalleryApp - crud de imágenes</title>
      </Helmet>

      <Title style={{ textAlign: 'center', justifyContent: 'center' }} level={3}>
        Tamaño máximo de imagen: 2MB
      </Title>

      <Title style={{ textAlign: 'center', justifyContent: 'center' }} level={5}>
        *Ficheros permitidos: <Text mark>jpeg jpg png gif.</Text>
      </Title>

      <Space direction="horizontal" style={{ width: '100%', justifyContent: 'center' }}>

        <input
          id="fileinput"
          onChange={selectedHandler}
          accept=".png, .gif, .jpeg, .jpg"
          type="file"
        />

        <Button type="primary" onClick={sendHandler}>
          Cargar
        </Button>

      </Space>

      <Divider />

      <div style={{ textAlign: 'center', justifyContent: 'center' }}>

        {imageslists.map((image) => {
          return (
            <>
              <Space>
                <Card
                  type="inner"
                  style={{
                    width: 350,
                  }}
                >
                  <img
                    src={`http://${hostname}:${port}/` + image}
                    key={image}
                    alt=".."
                    width="300"
                    height="300"
                  />
                  <Button onClick={() => hanleModal(true, image)}>Abrir</Button>
                </Card>
              </Space>
            </>
          );
        })}

      </div>

      <Modal
        isOpen={modalopen}
        onRequestClose={() => hanleModal(false, null)}
      >
        <div>

          <img
            src={`http://${hostname}:${port}/` + cureeImg}
            alt="..."
          />

          <Divider />

          <Space>

            <Button type="primary" danger
              onClick={() => deletehanle()}>
              Borrar
            </Button>

            <Button
              danger
              onClick={() => hanleModal(false, null)}>
              Cerrar
            </Button>

          </Space>

        </div>
      </Modal>

    </div>
  );
}

export default App;