import { IoAddOutline } from "react-icons/io5";
import "./AddToNew.scss";
import { useState } from "react";
import PreviewCollectionModal from "../../../../Components/PreviewFeaturedNews/index";


export default function AddToNew() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  }
  const handleCloseModal = () => {
    setIsModalOpen(false);
  }
  return (
    <div>
      <div className="CreateNrew" onClick={handleOpenModal}>
        <div className="CreateNrew__wrapper">
          <div className="CreateNrew__icon">
            <div className="CreateNrew__background-icon">
              <IoAddOutline />
            </div>
          </div>
          <span className="CreateNrew__text">Mới</span>
        </div>
      </div>
      <PreviewCollectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}