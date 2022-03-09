package work.onss.vo;

import lombok.Data;

import java.io.Serializable;

@Data
public class WXLogin implements Serializable {
    private String subAppId;
    private String suiteId;
    private String code;
    private String encryptedData;
    private String iv;
}
